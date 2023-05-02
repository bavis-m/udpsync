import { createRoot } from 'react-dom/client';
import { Toast } from "./toast.jsx";
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
        <form action="do_login" method="post">
        <Box m={2}>
        <Grid container direction="column">        
            <TextField variant="outlined" label="User Name" type="text" name="user" autoFocus/><br/>
            <TextField variant="outlined" label="Password" type="password" name="password" /><br/>
            <Button variant="contained" type="submit">Login</Button><br/>        
        </Grid>
        </Box>
        </form>
        </Container>
        </ThemeProvider>
    </React.Fragment>
);