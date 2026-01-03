import { useState } from 'react';
import Avatar from 'boring-avatars';
import { Users, Info, Settings, Shield, ShieldOff, Volume2, VolumeX, Ban, UserCheck, X } from 'lucide-react';
import { roomService } from '../../services/api';

const ChatSidebar = ({ room, currentUser, onlineUsers = [], participants = [], onClose }) => {
    const [openDropdownUserId, setOpenDropdownUserId] = useState(null);
    const [loadingModeratorChange, setLoadingModeratorChange] = useState(false);

    const ownerId = room?.ownerId || room?.owner_id || room?.owner?.id;
    const isOwner = !!currentUser?.id && !!ownerId && String(ownerId) === String(currentUser.id);
    const ui = room?.uiSettings || {};
    const primaryColor = ui.primaryColor || '#6366f1';
    const sidebarColor = ui.bgType === 'color' ? ui.bgValue : '#2d3748';

    const isLightTheme = ui.theme === 'light';
    const textColorClass = isLightTheme ? 'text-slate-900' : 'text-white';
    const subTextColorClass = isLightTheme ? 'text-slate-500' : 'text-chat-light/40';

    // Online users'lara username'leri participants'tan ekle
    const enrichedOnlineUsers = onlineUsers.map(onlineUser => {
        // Eğer username zaten varsa ve "Anonymous" değilse, kullan
        if (onlineUser.username && onlineUser.username !== 'Anonymous') {
            return onlineUser;
        }
        
        // Participants'tan username bul
        const participant = participants.find(p => 
            String(p.user?.id || p.userId) === String(onlineUser.userId)
        );
        
        return {
            ...onlineUser,
            username: participant?.user?.username || participant?.username || onlineUser.username || 'Anonymous'
        };
    });

    // Merge participants with online status from socket
    const participantsWithOnlineStatus = participants.map(participant => {
        const isOnline = enrichedOnlineUsers.some(u => String(u.userId) === String(participant.user.id));
        return {
            ...participant,
            isOnline
        };
    });

    // Sort by role: OWNER > MODERATOR > MEMBER
    const sortedParticipants = [...participantsWithOnlineStatus].sort((a, b) => {
        const roleOrder = { OWNER: 0, MODERATOR: 1, MEMBER: 2 };
        return roleOrder[a.role] - roleOrder[b.role];
    });

    const totalParticipants = participants.length;

    // Debug logging
    console.log('👥 ChatSidebar - Online Users (raw):', onlineUsers);
    console.log('👥 ChatSidebar - Online Users (enriched):', enrichedOnlineUsers);
    console.log('🎭 ChatSidebar - Participants:', participants);
    console.log('👤 ChatSidebar - Current User:', currentUser);
    console.log('🏠 ChatSidebar - Room:', room);

    const handleModeratorToggle = async (userId, currentlyModerator) => {
        try {
            setLoadingModeratorChange(true);
            await roomService.setModeratorStatus(room.id, userId, !currentlyModerator);
            setOpenDropdownUserId(null);
            alert(currentlyModerator ? 'Kullanıcı moderatörlükten alındı!' : 'Kullanıcı moderatör yapıldı!');
            window.location.reload();
        } catch (error) {
            console.error('Moderator status update failed:', error);
            alert('İşlem başarısız oldu. Lütfen tekrar deneyin.');
        } finally {
            setLoadingModeratorChange(false);
        }
    };

    const handleMute = async (userId) => {
        try {
            setLoadingModeratorChange(true);
            await roomService.muteParticipant(room.id, userId);
            setOpenDropdownUserId(null);
            alert('Kullanıcı sessize alındı!');
            window.location.reload();
        } catch (error) {
            console.error('Mute failed:', error);
            alert('İşlem başarısız oldu. Lütfen tekrar deneyin.');
        } finally {
            setLoadingModeratorChange(false);
        }
    };

    const handleUnmute = async (userId) => {
        try {
            setLoadingModeratorChange(true);
            await roomService.unmuteParticipant(room.id, userId);
            setOpenDropdownUserId(null);
            alert('Kullanıcının sessizliği kaldırıldı!');
            window.location.reload();
        } catch (error) {
            console.error('Unmute failed:', error);
            alert('İşlem başarısız oldu. Lütfen tekrar deneyin.');
        } finally {
            setLoadingModeratorChange(false);
        }
    };

    const handleBan = async (userId) => {
        if (!confirm('Bu kullanıcıyı banlamak istediğinizden emin misiniz?')) return;
        try {
            setLoadingModeratorChange(true);
            await roomService.banParticipant(room.id, userId);
            setOpenDropdownUserId(null);
            alert('Kullanıcı banlandı!');
            window.location.reload();
        } catch (error) {
            console.error('Ban failed:', error);
            alert('İşlem başarısız oldu. Lütfen tekrar deneyin.');
        } finally {
            setLoadingModeratorChange(false);
        }
    };

    const handleUnban = async (userId) => {
        try {
            setLoadingModeratorChange(true);
            await roomService.unbanParticipant(room.id, userId);
            setOpenDropdownUserId(null);
            alert('Kullanıcının banı kaldırıldı!');
            window.location.reload();
        } catch (error) {
            console.error('Unban failed:', error);
            alert('İşlem başarısız oldu. Lütfen tekrar deneyin.');
        } finally {
            setLoadingModeratorChange(false);
        }
    };

    return (
        <div
            className={`w-full md:w-64 border-l flex flex-col h-full shadow-2xl z-10 ${isLightTheme ? 'border-slate-200 shadow-slate-200' : 'border-white/10 shadow-black'}`}
            style={{ backgroundColor: sidebarColor, filter: isLightTheme ? 'none' : 'brightness(0.9)' }}
        >
            {/* Mobile Close Button */}
            {onClose && (
                <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className={`font-bold ${textColorClass}`}>Room Details</h3>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isLightTheme ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}
                    >
                        <X size={24} className={textColorClass} />
                    </button>
                </div>
            )}
            {/* Room Info Section */}
            <div className={`p-6 border-b ${isLightTheme ? 'border-slate-200' : 'border-white/10'}`}>
                <div className="flex items-center gap-2 mb-3">
                    <Info size={18} style={{ color: primaryColor }} />
                    <h3 className={`font-bold text-sm uppercase tracking-wider ${textColorClass}`}>Sticky Message</h3>
                </div>
                <div className={`${isLightTheme ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-chat-light/90'} border p-3 rounded-xl mb-4 shadow-inner`}>
                    <p className="text-sm leading-relaxed italic">
                        "{room?.logicConfig?.stickyMessage || room?.description || "Welcome to our room! Please be respectful to others."}"
                    </p>
                </div>

                {/* Room Details */}
                <div className="space-y-3">
                    <div className={`flex items-center justify-between text-[10px] font-bold uppercase tracking-widest ${subTextColorClass}`}>
                        <div className="flex items-center gap-2">
                            <Users size={12} />
                            <span>Capacity</span>
                        </div>
                        <span className={isLightTheme ? 'text-slate-600' : 'text-chat-light/80'}>{room?.maxUsers || 50} users</span>
                    </div>
                </div>

                {/* API Key for Owner */}
                {isOwner && room?.apiKey && (
                    <div className={`mt-6 pt-6 border-t ${isLightTheme ? 'border-slate-200' : 'border-white/10'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${subTextColorClass}`}>Room API Key</p>
                        <div className={`${isLightTheme ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/20 border-white/10 text-chat-light/70'} border rounded-lg p-2.5 flex items-center justify-between group`}>
                            <code className="text-[10px] truncate mr-2 font-mono">
                                {room.apiKey}
                            </code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(room.apiKey);
                                    alert("API Key copied to clipboard!");
                                }}
                                className={`text-[10px] font-bold uppercase transition-colors ${isLightTheme ? 'text-slate-500 hover:text-slate-900' : 'text-chat-light hover:text-white'}`}
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Participants Section */}
            <div className="flex-1 overflow-y-auto p-4">
                <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${isLightTheme ? 'text-slate-400' : 'text-chat-light/30'}`}>
                    Participants — {totalParticipants}
                </h4>
                <ul className="space-y-2">
                    {sortedParticipants.length > 0 ? (
                        sortedParticipants.map((participant) => {
                            const user = participant.user;
                            const isModerator = participant.role === 'MODERATOR';
                            const isRoomOwner = participant.role === 'OWNER';
                            const isCurrentUserOwner = isOwner;

                            // Check if current user is moderator
                            const currentUserParticipant = participants.find(p => String(p.user.id) === String(currentUser?.id));
                            const isCurrentUserModerator = currentUserParticipant?.role === 'MODERATOR';

                            const isNotSelf = user.id !== currentUser?.id;
                            // Owner or Moderator can manage, but can't manage themselves or the room owner
                            const showEditButton = (isCurrentUserOwner || isCurrentUserModerator) && isNotSelf && !isRoomOwner;
                            const dropdownOpen = openDropdownUserId === user.id;

                            return (
                                <li key={participant.id} className="relative">
                                    <div className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer group border border-transparent ${isLightTheme ? 'hover:bg-slate-100 hover:border-slate-200' : 'hover:bg-white/5 hover:border-white/5'}`}>
                                        <div className="relative">
                                            <Avatar
                                                size={32}
                                                name={user.username}
                                                variant="beam"
                                                colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
                                            />
                                            {participant.isOnline ? (
                                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 rounded-full ${isLightTheme ? 'border-white' : 'border-[#1f2937]'}`}></span>
                                            ) : (
                                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-gray-400 border-2 rounded-full ${isLightTheme ? 'border-white' : 'border-[#1f2937]'}`}></span>
                                            )}
                                        </div>
                                        <div className="flex-1 flex items-center gap-2 min-w-0">
                                            <span className={`text-sm font-medium truncate ${isLightTheme ? 'text-slate-700 group-hover:text-slate-900' : 'text-chat-light group-hover:text-white'}`}>
                                                {user.username} {user.id === currentUser?.id ? '(You)' : ''}
                                            </span>
                                            {isRoomOwner && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500 text-white font-bold flex-shrink-0" title="Room Owner">
                                                    👑
                                                </span>
                                            )}
                                            {isModerator && (
                                                <Shield size={14} className="text-yellow-500 flex-shrink-0" title="Moderator" />
                                            )}
                                        </div>

                                        {/* Edit Button - Only for owner */}
                                        {showEditButton && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDropdownUserId(dropdownOpen ? null : user.id);
                                                }}
                                                className={`p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100 ${isLightTheme ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/10 text-chat-light/60'}`}
                                                disabled={loadingModeratorChange}
                                            >
                                                <Settings size={16} />
                                            </button>
                                        )}
                                    </div>


                                    {/* Dropdown Menu */}
                                    {dropdownOpen && showEditButton && (
                                        <div className={`absolute right-0 top-full mt-1 w-56 rounded-lg shadow-xl border z-50 overflow-hidden ${isLightTheme ? 'bg-white border-slate-200' : 'bg-gray-800 border-white/10'}`}>
                                            {/* Moderator Toggle - Only for OWNER */}
                                            {isCurrentUserOwner && (
                                                <>
                                                    <button
                                                        onClick={() => handleModeratorToggle(user.id, isModerator)}
                                                        disabled={loadingModeratorChange}
                                                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${isLightTheme
                                                                ? 'hover:bg-slate-100 text-slate-700'
                                                                : 'hover:bg-white/10 text-chat-light'
                                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    >
                                                        {isModerator ? (
                                                            <>
                                                                <ShieldOff size={16} className="text-red-500" />
                                                                <span>Moderatörlükten Al</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Shield size={16} className="text-yellow-500" />
                                                                <span>Moderatör Yap</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <div className={`h-px ${isLightTheme ? 'bg-slate-200' : 'bg-white/10'}`}></div>
                                                </>
                                            )}

                                            {/* Mute/Unmute - For OWNER and MODERATOR */}
                                            {participant.status !== 'BANNED' && (
                                                <button
                                                    onClick={() => participant.status === 'MUTED' ? handleUnmute(user.id) : handleMute(user.id)}
                                                    disabled={loadingModeratorChange}
                                                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${isLightTheme
                                                            ? 'hover:bg-slate-100 text-slate-700'
                                                            : 'hover:bg-white/10 text-chat-light'
                                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                >
                                                    {participant.status === 'MUTED' ? (
                                                        <>
                                                            <Volume2 size={16} className="text-green-500" />
                                                            <span>Susturmayı Kaldır</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <VolumeX size={16} className="text-orange-500" />
                                                            <span>Sustur</span>
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                            {/* Ban/Unban - For OWNER and MODERATOR */}
                                            <button
                                                onClick={() => participant.status === 'BANNED' ? handleUnban(user.id) : handleBan(user.id)}
                                                disabled={loadingModeratorChange}
                                                className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-colors ${isLightTheme
                                                        ? 'hover:bg-slate-100 text-slate-700'
                                                        : 'hover:bg-white/10 text-chat-light'
                                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {participant.status === 'BANNED' ? (
                                                    <>
                                                        <UserCheck size={16} className="text-green-500" />
                                                        <span>Banı Kaldır</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Ban size={16} className="text-red-500" />
                                                        <span>Banla</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </li>
                            );
                        })
                    ) : (
                        <li className={`text-center py-8 ${subTextColorClass}`}>
                            <p className="text-sm">No participants yet</p>
                        </li>
                    )}
                </ul>
            </div>

            {/* Click outside to close dropdown */}
            {openDropdownUserId && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpenDropdownUserId(null)}
                />
            )}
        </div>
    );
};

export default ChatSidebar;
