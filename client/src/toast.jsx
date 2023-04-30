import { createRoot } from 'react-dom/client';
import { ToastContainer, toast as reactToast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import convertHtmlToReact from '@hedgedoc/html-to-react';

export function toast(toasts)
{
    if (!Array.isArray(toasts))
    {
        toasts = [toasts];
    }

    for (const t of toasts)
    {
        const ret = convertHtmlToReact(t)
        reactToast(<>{ret}</>);
    }
}

const domNode = document.createElement('div');
domNode.id = "toast";
document.body.appendChild(domNode);
const root = createRoot(domNode);

root.render(<ToastContainer
    position="top-center"
    autoClose={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    theme="light"
    />);