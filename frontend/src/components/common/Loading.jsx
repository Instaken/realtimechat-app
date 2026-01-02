/**
 * Full Page Loading Component
 */
export const PageLoader = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
    );
};
