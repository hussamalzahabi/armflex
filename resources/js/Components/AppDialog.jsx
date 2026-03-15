import { Dialog } from 'primereact/dialog';
import { useTheme } from '@/hooks/useTheme';

const joinClasses = (...classes) => classes.filter(Boolean).join(' ');

const AppDialog = ({ className = '', maskClassName = '', ...props }) => {
    const { isDark } = useTheme();

    return (
        <Dialog
            {...props}
            modal
            draggable={false}
            className={joinClasses('app-dialog', isDark ? 'app-dialog-dark' : 'app-dialog-light', className)}
            maskClassName={joinClasses('app-dialog-mask', isDark ? 'app-dialog-mask-dark' : 'app-dialog-mask-light', maskClassName)}
        />
    );
};

export default AppDialog;
