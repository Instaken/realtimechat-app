# Backend Requirements for Widget System

## 📌 Required Endpoints

### 1. GET `/api/rooms/api-key/:apiKey`

Widget'ın API key ile room bilgisini alması için gerekli.

**Controller Örneği:**
```javascript
// rooms.controller.js
async getRoomByApiKey(req, res) {
    try {
        const { apiKey } = req.params;
        
        const room = await prisma.room.findFirst({
            where: { apiKey: apiKey },
            include: {
                owner: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        avatarUrl: true
                    }
                },
                plan: true
            }
        });

        if (!room) {
            return res.status(404).json({ 
                message: 'Room not found or invalid API key' 
            });
        }

        res.json({ room });
    } catch (error) {
        console.error('Error fetching room by API key:', error);
        res.status(500).json({ 
            message: 'Failed to fetch room' 
        });
    }
}
```

**Route Örneği:**
```javascript
// rooms.routes.js
router.get('/api-key/:apiKey', roomsController.getRoomByApiKey);
```

### 2. GET `/api/rooms/:roomId/participants`

Zaten mevcut olmalı. Room katılımcılarını döner.

**Response:**
```json
{
    "participants": [
        {
            "id": "u1",
            "username": "user1",
            "avatarUrl": "...",
            "isModerator": false,
            "isMuted": false
        }
    ]
}
```

### 3. Socket.io Events

Widget'ın socket bağlantısı için:

```javascript
// socket.js
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join room
    socket.on('join_room', async ({ roomSlug, userId, username }) => {
        try {
            socket.join(roomSlug);
            socket.roomSlug = roomSlug;
            socket.userId = userId;

            // Notify others
            socket.to(roomSlug).emit('user_joined', {
                userId,
                username,
                timestamp: new Date()
            });

            // Send online users
            const room = io.sockets.adapter.rooms.get(roomSlug);
            const onlineCount = room ? room.size : 0;
            
            io.to(roomSlug).emit('online_users', {
                count: onlineCount,
                users: [] // Optional: detailed user list
            });
        } catch (error) {
            console.error('Join room error:', error);
        }
    });

    // Send message
    socket.on('send_message', async ({ roomSlug, message }) => {
        try {
            // Save to database
            const newMessage = await prisma.message.create({
                data: {
                    roomId: message.roomId,
                    userId: message.userId,
                    content: message.content,
                    type: message.type || 'text'
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatarUrl: true
                        }
                    }
                }
            });

            // Broadcast to room
            io.to(roomSlug).emit('new_message', {
                id: newMessage.id,
                content: newMessage.content,
                userId: newMessage.userId,
                username: newMessage.user.username,
                avatarUrl: newMessage.user.avatarUrl,
                createdAt: newMessage.createdAt
            });
        } catch (error) {
            console.error('Send message error:', error);
        }
    });

    // Typing indicator
    socket.on('typing', ({ roomSlug, username, isTyping }) => {
        socket.to(roomSlug).emit('user_typing', {
            username,
            isTyping
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        if (socket.roomSlug) {
            socket.to(socket.roomSlug).emit('user_left', {
                userId: socket.userId,
                timestamp: new Date()
            });
        }
    });
});
```

## 🔒 CORS Configuration

Widget farklı domain'lerden çalışacağı için CORS ayarları gerekli:

```javascript
// app.js or server.js
import cors from 'cors';

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Check if origin is allowed (from room's allowedDomains)
        // For now, allow all in development
        callback(null, true);
    },
    credentials: true
}));
```

**Advanced CORS (Room-based):**
```javascript
// Middleware to check room's allowed domains
async function checkRoomDomain(req, res, next) {
    const origin = req.headers.origin;
    const apiKey = req.params.apiKey || req.body.apiKey;
    
    if (!apiKey) return next();
    
    const room = await prisma.room.findFirst({
        where: { apiKey }
    });
    
    if (!room) return res.status(404).json({ message: 'Room not found' });
    
    // Check if origin is in allowedDomains
    const allowedDomains = room.allowedDomains || [];
    
    if (allowedDomains.length === 0 || allowedDomains.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        return next();
    }
    
    return res.status(403).json({ 
        message: 'Domain not allowed for this room' 
    });
}
```

## 📝 Database Schema

Room modelinde `apiKey` field'ı olmalı:

```prisma
model Room {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  apiKey          String   @unique @default(cuid())  // Widget için
  ownerId         String
  planId          String
  allowedDomains  String[] // CORS için
  logicConfig     Json?    // { guestAccess: true, ... }
  uiSettings      Json?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  owner       User      @relation(fields: [ownerId], references: [id])
  plan        RoomPlan  @relation(fields: [planId], references: [id])
  messages    Message[]
  participants RoomParticipant[]
}
```

## 🧪 Testing

### Test API Key Endpoint
```bash
curl http://localhost:3000/api/rooms/api-key/demo_key_12345
```

### Test CORS
```bash
curl -H "Origin: http://example.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3000/api/rooms/api-key/demo_key_12345
```

## ✅ Checklist

Backend'de widget için gerekli olan işlemler:

- [ ] `GET /api/rooms/api-key/:apiKey` endpoint'i ekle
- [ ] CORS ayarlarını yapılandır
- [ ] Socket.io event handler'ları kontrol et
- [ ] Room model'e `apiKey` field'ı ekle (varsa)
- [ ] `allowedDomains` validasyonu ekle
- [ ] Guest user desteği ekle
- [ ] Rate limiting ekle (widget abuse için)
- [ ] Analytics tracking ekle (opsiyonel)

## 📚 Additional Features (Optional)

### Rate Limiting
```javascript
import rateLimit from 'express-rate-limit';

const widgetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per windowMs
    message: 'Too many requests from this IP'
});

router.get('/api-key/:apiKey', widgetLimiter, roomsController.getRoomByApiKey);
```

### Analytics
```javascript
// Track widget loads
await prisma.roomAnalytics.create({
    data: {
        roomId: room.id,
        eventType: 'widget_load',
        origin: req.headers.origin,
        userAgent: req.headers['user-agent'],
        timestamp: new Date()
    }
});
```

### Webhook Support
```javascript
// Notify room owner of new messages via webhook
if (room.webhookUrl) {
    await fetch(room.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            event: 'new_message',
            roomId: room.id,
            message: newMessage
        })
    });
}
```

---

**Not:** Bu endpoint'ler implement edildikten sonra widget tamamen fonksiyonel hale gelecektir.
