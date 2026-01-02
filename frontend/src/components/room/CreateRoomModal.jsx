import { useState, useEffect } from 'react';
import { X, Hash, Users, Shield, Globe, Palette, Lock, Settings, MessageSquare, Check, Loader2, Plus } from 'lucide-react';
import { planService } from '../../services/api';

const CreateRoomModal = ({ isOpen, onClose, onCreateRoom, editingRoom }) => {
    const [activeTab, setActiveTab] = useState('basic');
    const [plans, setPlans] = useState([]);
    const [loadingPlans, setLoadingPlans] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        isPrivate: false,
        password: '',
        maxUsers: 50,
        allowedDomains: [],
        roomPlanId: '',
        uiSettings: {
            theme: 'dark',
            primaryColor: '#6366f1',
            bgType: 'color',
            bgValue: '#1f2937',
            bubbleStyle: 'modern',
            fontSettings: {
                family: 'Inter',
                baseSize: 14,
                weight: 'medium'
            },
            headerTitle: '',
            showBranding: true
        },
        logicConfig: {
            slowMode: 0,
            allowGifs: true,
            profanityFilter: false,
            guestAccess: true,
            showTyping: true,
            readReceipts: true,
            stickyMessage: '',
            historyRetentionDays: 30
        }
    });

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
        }
    }, [isOpen]);

    const fetchPlans = async () => {
        try {
            setLoadingPlans(true);
            const data = await planService.getAllPlans();
            console.log("Fetched Plans Data:", data);

            // Backend sends { plans: [...] } instead of directly [...]
            const plansArray = Array.isArray(data) ? data : (data.plans || []);
            setPlans(plansArray);

            if (plansArray.length > 0 && !formData.roomPlanId) {
                setFormData(prev => ({ ...prev, roomPlanId: plansArray[0].id }));
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
        } finally {
            setLoadingPlans(false);
        }
    };

    // Update form when editing a room
    useEffect(() => {
        if (editingRoom && isOpen) {
            setFormData({
                name: editingRoom.name || '',
                slug: editingRoom.slug || '',
                isPrivate: editingRoom.isPrivate || false,
                password: '', // Password usually not returned
                maxUsers: editingRoom.maxUsers || 50,
                allowedDomains: editingRoom.allowedDomains || [],
                roomPlanId: editingRoom.roomPlanId || '',
                uiSettings: editingRoom.uiSettings || {
                    theme: 'dark',
                    primaryColor: '#6366f1',
                    bgType: 'color',
                    bgValue: '#1f2937',
                    bubbleStyle: 'rounded',
                    fontSettings: { family: 'Inter', baseSize: 14, weight: 'medium' },
                    headerTitle: editingRoom.name || '',
                    showBranding: true
                },
                logicConfig: editingRoom.logicConfig || {
                    slowMode: 0,
                    allowGifs: true,
                    profanityFilter: false,
                    guestAccess: true,
                    showTyping: true,
                    readReceipts: true,
                    stickyMessage: '',
                    historyRetentionDays: 30
                }
            });
        }
    }, [editingRoom, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: val
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: val }));
        }
    };

    const handleUiChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            uiSettings: {
                ...prev.uiSettings,
                [field]: value
            }
        }));
    };

    const handleFontChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            uiSettings: {
                ...prev.uiSettings,
                fontSettings: {
                    ...prev.uiSettings.fontSettings,
                    [field]: value
                }
            }
        }));
    };

    const handleLogicChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            logicConfig: { ...prev.logicConfig, [name]: value }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Prepare data for backend requirements
        const finalData = {
            ...formData,
            maxUsers: parseInt(formData.maxUsers, 10),
            // Ensure allowedDomains has at least one entry if empty
            allowedDomains: formData.allowedDomains.length > 0
                ? formData.allowedDomains
                : [window.location.origin]
        };

        // Ensure headerTitle is set if empty
        if (!finalData.uiSettings.headerTitle) {
            finalData.uiSettings.headerTitle = finalData.name;
        }

        // Validate plan selection
        if (!finalData.roomPlanId) {
            alert("Please select a Room Plan. If none appear, the system might be missing initial plans.");
            return;
        }

        onCreateRoom(finalData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#464655] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-chat-grey/30">
                {/* Header */}
                <div className="p-6 border-b border-chat-grey/30 flex items-center justify-between bg-[#3b3b4d]">
                    <div className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-chat-light/20 rounded-lg">
                            <Hash size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">
                                {editingRoom ? 'Room Settings' : 'Create New Room'}
                            </h2>
                            <p className="text-sm text-chat-light opacity-80">Configure your community space</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-chat-grey/30 bg-[#3b3b4d]/50">
                    <TabButton
                        active={activeTab === 'basic'}
                        onClick={() => setActiveTab('basic')}
                        icon={<Settings size={18} />}
                        label="Basic Info"
                    />
                    <TabButton
                        active={activeTab === 'ui'}
                        onClick={() => setActiveTab('ui')}
                        icon={<Palette size={18} />}
                        label="UI Design"
                    />
                    <TabButton
                        active={activeTab === 'logic'}
                        onClick={() => setActiveTab('logic')}
                        icon={<Shield size={18} />}
                        label="Logic & Safety"
                    />
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#464655]">
                    <form id="room-form" onSubmit={handleSubmit} className="space-y-8">
                        {activeTab === 'basic' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                                {/* Left Column: Info */}
                                <div className="space-y-6">
                                    <FormGroup label="Room Name" required>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-chat-grey" size={18} />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        name: val,
                                                        slug: prev.slug === prev.name.toLowerCase().replace(/ /g, '-') ? val.toLowerCase().replace(/ /g, '-') : prev.slug
                                                    }));
                                                }}
                                                className="form-input transition-all duration-300"
                                                placeholder="My Awesome Room"
                                                required
                                                minLength={3}
                                            />
                                        </div>
                                    </FormGroup>

                                    <FormGroup label="Room Slug (URL)" required>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-chat-grey" size={18} />
                                            <input
                                                type="text"
                                                name="slug"
                                                value={formData.slug}
                                                onChange={handleChange}
                                                className="form-input"
                                                placeholder="my-awesome-room"
                                                required
                                                minLength={3}
                                            />
                                        </div>
                                        <p className="text-xs text-chat-grey mt-1">uzo.chat/room/{formData.slug || '...'}</p>
                                    </FormGroup>

                                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-chat-dark/30 rounded-xl border border-chat-grey/20">
                                        <div className={`p-3 rounded-lg transition-colors ${formData.isPrivate ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                            {formData.isPrivate ? <Lock size={24} /> : <Globe size={24} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white">Privacy Status</p>
                                            <p className="text-xs text-chat-grey">{formData.isPrivate ? 'Requires a password to join' : 'Open to everyone with a link'}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isPrivate"
                                                checked={formData.isPrivate}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-chat-light"></div>
                                        </label>
                                    </div>

                                    {formData.isPrivate && (
                                        <FormGroup label="Join Password" required>
                                            <div className="relative animate-slideDown">
                                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-chat-grey" size={18} />
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="form-input"
                                                    placeholder="••••••••"
                                                    required={formData.isPrivate}
                                                />
                                            </div>
                                        </FormGroup>
                                    )}
                                </div>

                                {/* Right Column: Limits & Plans */}
                                <div className="space-y-6">
                                    <FormGroup label="Room Plan">
                                        {loadingPlans ? (
                                            <div className="h-24 flex items-center justify-center bg-chat-dark/10 rounded-xl border border-dashed border-chat-grey/30">
                                                <Loader2 className="animate-spin text-chat-light" />
                                            </div>
                                        ) : plans.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-3">
                                                {plans.map(plan => (
                                                    <button
                                                        key={plan.id}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, roomPlanId: plan.id, maxUsers: Math.min(prev.maxUsers, plan.maxUsers) }))}
                                                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${formData.roomPlanId === plan.id
                                                            ? 'border-chat-light bg-chat-light/5'
                                                            : 'border-chat-grey/20 bg-white dark:bg-chat-dark/30 hover:border-chat-grey/50'
                                                            }`}
                                                    >
                                                        <div className="text-left">
                                                            <p className={`font-bold ${formData.roomPlanId === plan.id ? 'text-chat-light' : 'text-gray-900 dark:text-white'}`}>
                                                                {plan.name}
                                                            </p>
                                                            <p className="text-xs text-chat-grey">Up to {plan.maxUsers} users • {plan.retentionDays} days history</p>
                                                        </div>
                                                        {formData.roomPlanId === plan.id && <Check className="text-chat-light" size={20} />}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-xs italic">
                                                No room plans found in the system. Please contact the administrator.
                                            </div>
                                        )}
                                    </FormGroup>

                                    <FormGroup label="Max Participants">
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-chat-grey" size={18} />
                                            <input
                                                type="number"
                                                name="maxUsers"
                                                value={formData.maxUsers}
                                                onChange={handleChange}
                                                min="2"
                                                max={plans.find(p => p.id === formData.roomPlanId)?.maxUsers || 500}
                                                className="form-input"
                                            />
                                        </div>
                                    </FormGroup>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ui' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-4 p-5 bg-white dark:bg-chat-dark/30 rounded-2xl border border-chat-grey/20">
                                        <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <Palette size={18} className="text-chat-light" />
                                            Main Theme
                                        </p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['light', 'dark', 'system'].map(t => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => handleUiChange('theme', t)}
                                                    className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize transition-all ${formData.uiSettings.theme === t
                                                        ? 'bg-chat-light text-chat-dark scale-105 shadow-lg'
                                                        : 'bg-chat-grey/10 text-chat-grey hover:bg-chat-grey/20'
                                                        }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-5 bg-white dark:bg-chat-dark/30 rounded-2xl border border-chat-grey/20">
                                        <p className="font-bold text-gray-900 dark:text-white">Primary Color</p>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={formData.uiSettings.primaryColor}
                                                onChange={(e) => handleUiChange('primaryColor', e.target.value)}
                                                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-white/20 shadow-lg"
                                            />
                                            <input
                                                type="text"
                                                value={formData.uiSettings.primaryColor}
                                                onChange={(e) => handleUiChange('primaryColor', e.target.value)}
                                                className="flex-1 bg-chat-grey/10 border-0 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-5 bg-white dark:bg-chat-dark/30 rounded-2xl border border-chat-grey/20">
                                        <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <MessageSquare size={18} className="text-chat-light" />
                                            Bubble Style
                                        </p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['rounded', 'sharp', 'modern'].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => handleUiChange('bubbleStyle', s)}
                                                    className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase transition-all ${formData.uiSettings.bubbleStyle === s
                                                        ? 'bg-chat-light text-chat-dark shadow-lg shadow-chat-light/20'
                                                        : 'bg-chat-grey/10 text-chat-grey hover:bg-chat-grey/20'
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Font Settings */}
                                <div className="p-6 bg-white dark:bg-chat-dark/30 rounded-2xl border border-chat-grey/20 space-y-6">
                                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <span className="w-8 h-8 rounded bg-chat-light/20 text-chat-light flex items-center justify-center font-serif">Aa</span>
                                        Typography Settings
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-chat-grey mb-2">Font Family</label>
                                            <select
                                                value={formData.uiSettings.fontSettings.family}
                                                onChange={(e) => handleFontChange('family', e.target.value)}
                                                className="w-full bg-chat-grey/10 border-0 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-chat-light"
                                            >
                                                <option value="Inter">Inter (Default)</option>
                                                <option value="Outfit">Outfit (Rounder)</option>
                                                <option value="Roboto">Roboto (Clean)</option>
                                                <option value="Montserrat">Montserrat (Bold)</option>
                                                <option value="Playfair Display">Playfair (Elegant)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-chat-grey mb-2">Font Size ({formData.uiSettings.fontSettings.baseSize}px)</label>
                                            <input
                                                type="range"
                                                min="12"
                                                max="18"
                                                step="1"
                                                value={formData.uiSettings.fontSettings.baseSize}
                                                onChange={(e) => handleFontChange('baseSize', parseInt(e.target.value))}
                                                className="w-full h-2 bg-chat-grey/20 rounded-lg appearance-none cursor-pointer accent-chat-light"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-chat-grey mb-2">Font Weight</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {['light', 'regular', 'medium', 'bold'].map(w => (
                                                    <button
                                                        key={w}
                                                        type="button"
                                                        onClick={() => handleFontChange('weight', w)}
                                                        className={`py-1.5 px-2 rounded-md text-[10px] font-bold uppercase transition-all ${formData.uiSettings.fontSettings.weight === w
                                                            ? 'bg-chat-light/20 text-chat-light border border-chat-light/50'
                                                            : 'bg-chat-grey/5 text-chat-grey border border-transparent hover:bg-chat-grey/10'
                                                            }`}
                                                    >
                                                        {w}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Background Settings */}
                                <div className="p-6 bg-white dark:bg-chat-dark/30 rounded-2xl border border-chat-grey/20">
                                    <p className="font-bold text-gray-900 dark:text-white mb-4">Chat Background</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex gap-4">
                                                {['color', 'gradient', 'image'].map(type => (
                                                    <label key={type} className="flex-1 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="bgType"
                                                            checked={formData.uiSettings.bgType === type}
                                                            onChange={() => handleUiChange('bgType', type)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="text-center py-2 rounded-lg border-2 border-chat-grey/20 peer-checked:border-chat-light peer-checked:bg-chat-light/10 text-xs font-bold capitalize text-chat-grey peer-checked:text-chat-light transition-all">
                                                            {type}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                            <input
                                                type={formData.uiSettings.bgType === 'color' ? 'color' : 'text'}
                                                value={formData.uiSettings.bgValue}
                                                onChange={(e) => handleUiChange('bgValue', e.target.value)}
                                                className="w-full h-12 rounded-lg border-2 border-chat-grey/20 dark:bg-chat-dark/50 px-4 text-sm text-gray-900 dark:text-white"
                                                placeholder={formData.uiSettings.bgType === 'image' ? 'https://example.com/bg.jpg' : '#hexcode or linear-gradient(...)'}
                                            />
                                        </div>

                                        {/* Preview Card */}
                                        <div className="relative rounded-xl overflow-hidden border border-chat-grey/30 h-32 flex flex-col">
                                            <div className="bg-[#1f2937] p-2 flex items-center gap-2 border-b border-white/10">
                                                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                                <div className="flex-1 text-center truncate text-[10px] text-white/50">{formData.name || 'Room Name'}</div>
                                            </div>
                                            <div
                                                className="flex-1 p-3 flex flex-col gap-2"
                                                style={{
                                                    background: formData.uiSettings.bgType === 'image'
                                                        ? `url(${formData.uiSettings.bgValue}) center/cover`
                                                        : formData.uiSettings.bgValue
                                                }}
                                            >
                                                <div className="w-2/3 h-6 rounded-lg bg-white/20 backdrop-blur-sm self-start"></div>
                                                <div className="w-1/2 h-6 rounded-lg self-end" style={{ backgroundColor: formData.uiSettings.primaryColor }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'logic' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
                                {/* Safety Features */}
                                <div className="space-y-6">
                                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                        <Shield size={20} className="text-red-400" />
                                        Safety & Moderation
                                    </p>

                                    <ToggleSwitch
                                        label="Profanity Filter"
                                        description="Automatically mask bad words"
                                        checked={formData.logicConfig.profanityFilter}
                                        onChange={(v) => handleLogicChange('profanityFilter', v)}
                                    />

                                    <ToggleSwitch
                                        label="Guest Access"
                                        description="Allow users without an account"
                                        checked={formData.logicConfig.guestAccess}
                                        onChange={(v) => handleLogicChange('guestAccess', v)}
                                    />

                                    <FormGroup label="Slow Mode (Seconds)">
                                        <input
                                            type="number"
                                            value={formData.logicConfig.slowMode}
                                            onChange={(e) => handleLogicChange('slowMode', parseInt(e.target.value))}
                                            className="form-input"
                                            min="0"
                                            max="3600"
                                        />
                                    </FormGroup>
                                </div>

                                {/* Interaction Experience */}
                                <div className="space-y-6">
                                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                        <MessageSquare size={20} className="text-blue-400" />
                                        Advanced Features
                                    </p>

                                    <ToggleSwitch
                                        label="Allow GIFs"
                                        description="Enable Giphy integration"
                                        checked={formData.logicConfig.allowGifs}
                                        onChange={(v) => handleLogicChange('allowGifs', v)}
                                    />

                                    <ToggleSwitch
                                        label="Show Typing Indicators"
                                        checked={formData.logicConfig.showTyping}
                                        onChange={(v) => handleLogicChange('showTyping', v)}
                                    />

                                    <FormGroup label="Sticky Message">
                                        <textarea
                                            value={formData.logicConfig.stickyMessage}
                                            onChange={(e) => handleLogicChange('stickyMessage', e.target.value)}
                                            className="form-input min-h-[100px] py-3 h-auto"
                                            placeholder="Important announcement that stays at the top..."
                                        />
                                    </FormGroup>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-chat-grey/30 bg-[#3b3b4d]/20 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl border border-chat-grey/30 text-gray-600 dark:text-chat-light font-bold hover:bg-chat-grey/10 transition-all"
                    >
                        Discard
                    </button>
                    <button
                        type="submit"
                        form="room-form"
                        className="flex-1 bg-chat-light hover:scale-[1.02] active:scale-[0.98] text-chat-dark font-bold py-3 rounded-xl shadow-lg shadow-chat-light/20 transition-all flex items-center justify-center gap-2"
                    >
                        {editingRoom ? <Check size={20} /> : <Plus size={20} />}
                        {editingRoom ? 'Save Changes' : 'Create Room'}
                    </button>
                </div>
            </div>

            <style>{`
                .form-input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(154, 161, 198, 0.2);
                    border-radius: 0.75rem;
                    padding: 0.75rem 1rem 0.75rem 2.75rem;
                    color: white;
                    font-size: 0.875rem;
                    transition: all 0.3s;
                }
                .dark .form-input {
                    background: rgba(0, 0, 0, 0.2);
                }
                .light .form-input {
                    background: #f3f4f6;
                    color: #111827;
                    border-color: #d1d5db;
                }
                .form-input:focus {
                    outline: none;
                    border-color: #00D1FF;
                    box-shadow: 0 0 0 1px rgba(0, 209, 255, 0.2);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slideDown { animation: slideDown 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        type="button"
        className={`flex-1 flex items-center justify-center gap-2 py-4 px-2 text-sm font-bold transition-all relative ${active ? 'text-chat-light' : 'text-chat-grey hover:text-white hover:bg-white/5'
            }`}
    >
        {icon}
        <span className="hidden sm:inline">{label}</span>
        {active && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-chat-light rounded-t-full shadow-[0_-4px_10px_rgba(0,209,255,0.5)]"></div>
        )}
    </button>
);

const FormGroup = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 dark:text-chat-light mb-2">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        {children}
    </div>
);

const ToggleSwitch = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-chat-dark/30 rounded-xl border border-chat-grey/20">
        <div className="flex-1">
            <p className="font-bold text-gray-900 dark:text-white leading-none">{label}</p>
            {description && <p className="text-[10px] text-chat-grey mt-1">{description}</p>}
        </div>
        <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-chat-light"></div>
        </label>
    </div>
);

export default CreateRoomModal;
