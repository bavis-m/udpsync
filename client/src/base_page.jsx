import { createRoot } from 'react-dom/client';
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
import { AccountCircle } from '@mui/icons-material';
import { ManageAccounts } from '@mui/icons-material';

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

    const goToAccount = () => window.location.href = "/account.html";

    return (
        <>
            <Box style={{ position: "fixed", top: 0, right: 0, zIndex: 2000 }} m={2}>
                <IconButton onClick={handleClick}>
                    <AccountCircle style={{ fontSize:60 }}/>
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
                    <Typography><IconButton component="span" onClick={goToAccount}><ManageAccounts style={{ fontSize:30 }}/></IconButton> {props.authedUser.name}</Typography>
                    <form action="/do_logout" method="post">
                        <Button sx={{mt:2}} fullWidth variant="contained" type="submit">Log Out</Button>
                    </form>
                </Box>
            </Popover>
            
        </>
    );
}

export function createBasePage(content)
{
    const theme = createTheme();

    const root = createRoot(document.getElementById('root'));
    root.render(
        <React.Fragment>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <Toast/>
    
                { window.initial_data.authed_user && <LogoutBox authedUser={window.initial_data.authed_user}/> }
                
                <Container maxWidth="md" sx={{mt:3}}>
                    <Card sx={{p:3}}>
                        {content}
                    </Card>
                </Container>
            </ThemeProvider>
        </React.Fragment>
    );
};