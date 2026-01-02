import Avatar from 'boring-avatars';

/**
 * User Avatar Component
 * Displays a unique avatar for each user using boring-avatars
 */
const UserAvatar = ({
    username,
    size = 40,
    variant = 'beam',
    colors = ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90'],
    className = '',
    onClick
}) => {
    return (
        <div
            className={`cursor-pointer hover:opacity-90 transition-opacity ${className}`}
            onClick={onClick}
        >
            <Avatar
                size={size}
                name={username || 'Unknown'}
                variant={variant}
                colors={colors}
            />
        </div>
    );
};

export default UserAvatar;
