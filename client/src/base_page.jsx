//import { createRoot } from 'react-dom/client';
import { Toast } from "./toast.jsx";
import {
    CssBaseline,
    Container,
    Box,
    Card,
    Popover,
    IconButton,
    Typography,
    Button
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';
import { render } from 'react-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import HomeIcon from '@mui/icons-material/Home';

function LogoutBox(props)
{
    const [attach, setAttach] = React.useState(null);
    const handleClick = (event) => {
        setAttach(event.currentTarget);
    };

    const handleClose = () => {
        setAttach(null);
    };

    const open = Boolean(attach);
    const id = open ? 'logout-popover' : undefined;

    const goTo = url => (() => window.location.href = url);

    return (
        <>
            <Box style={{ position: "fixed", top: 0, right: 0, zIndex: 2000 }} m={2}>
                <IconButton onClick={goTo("/")}>
                    <HomeIcon style={{ fontSize:60 }}/>
                </IconButton>
                <IconButton onClick={handleClick}>
                    <AccountCircleIcon style={{ fontSize:60 }}/>
                </IconButton>
            </Box>
            <Popover
                    anchorEl={attach}
                    onClose={handleClose}
                    open={open}
                    id={id}
                    anchorOrigin={{vertical:'bottom', horizontal:'right'}}
                    transformOrigin={{vertical:'top', horizontal:'right'}}
                    PaperProps={{sx:{width: '300px'}}}
                    disablePortal
                    style={{zIndex: 2001}}
            >
                <Box m={2}>
                    <Typography><IconButton component="span" onClick={goTo("/account.html")}><ManageAccountsIcon style={{ fontSize:30 }}/></IconButton> {props.authedUser.name}</Typography>
                    <form action="/do_logout" method="post">
                        <Button sx={{mt:2}} fullWidth variant="contained" type="submit">Log Out</Button>
                    </form>
                </Box>
            </Popover>
            
        </>
    );
}

export function createBasePage(content, baseProps)
{
    if (!baseProps) baseProps = {};
    const theme = createTheme({
        palette:
        {
            background:
            {
                default: "#eeeee4"
            }
        },
        components:
        {
            MuiAccordion:
            {
                styleOverrides:
                {
                    root:
                    {
                        backgroundColor: "#f1f8f9"
                    }
                }
            }
        }
    });

    //const root = createRoot(document.getElementById('root'));
    const root = document.getElementById('root');
    render(
        <React.Fragment>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <Toast/>
    
                { window.initial_data.authed_user && <LogoutBox authedUser={window.initial_data.authed_user}/> }
                
                <Container maxWidth="md" sx={{mt:3}} {...baseProps}>
                    {content}
                </Container>
            </ThemeProvider>
        </React.Fragment>,
            root
    );
};