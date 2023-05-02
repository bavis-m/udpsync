import { createRoot } from 'react-dom/client';
import { Toast } from "./toast.jsx"; export { toast } from "./toast.jsx";
import { Button, Input, CssBaseline, Grid, Container, Box, FormControl, Toolbar, AppBar, TextField } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import React from 'react';

const theme = createTheme();

const root = createRoot(document.getElementById('root'));
root.render(
    <React.Fragment>
        <ThemeProvider theme={theme}>
        <Toast/>
        <Container maxWidth="md">
        <CssBaseline/>
        <form action="do_set_password" method="post">
        <Box m={2}>
        <Grid container direction="column">        
            <TextField variant="outlined" type="password" name="old_password" label="Old Password" autofocus/><br/>
            <TextField variant="outlined" type="password" name="new_password" label="New Password"/><br/>
            <TextField variant="outlined" type="password" name="new_password2" label="Confirm New Password"/><br/>
            <Button variant="contained" type="submit">Change Password</Button>
        </Grid>
        </Box>
        </form>

        <form action="do_logout" method="post">
        <Box m={2}>
        <Grid container direction="column">        
            <Button style={{marginTop:"50px"}} variant="contained" type="submit">Logout</Button><br/>        
        </Grid>
        </Box>
        </form>

        </Container>
        </ThemeProvider>
    </React.Fragment>
);