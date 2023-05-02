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
            <TextField variant="outlined" type="password" label="Admin password"/><br/>
            <Button variant="contained" type="submit">Set Admin Password</Button><br/>        
        </Grid>
        </Box>
        </form>
        </Container>
        </ThemeProvider>
    </React.Fragment>
);