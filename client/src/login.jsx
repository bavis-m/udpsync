import { createBasePage } from './base_page.jsx';

import { Button, Grid, Box, FormControl, TextField } from '@mui/material';
import React from 'react';

createBasePage(
    <FormControl component="form" fullWidth action="do_login" method="post">
        <Grid container direction="column" spacing={1}>
            <Grid item><TextField fullWidth variant="outlined" label="User Name" type="text" name="user" autoFocus/></Grid>
            <Grid item><TextField fullWidth variant="outlined" label="Password" type="password" name="password" /></Grid>
            <Grid item><Button fullWidth variant="contained" type="submit">Login</Button></Grid>
        </Grid>
    </FormControl>
);