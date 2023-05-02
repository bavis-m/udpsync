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
        reactToast(<div style={{display:'flex', alignItems: 'center', justifyContent: 'center'}}><div>{ret}</div></div>);
    }
}

if (Array.isArray(window.initial_toasts))
{
    toast(window.initial_toasts);
    delete window.initial_toasts;
}

export const Toast = (props) => <ToastContainer
                        position="top-center"
                        autoClose={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        theme="light"
                        />;