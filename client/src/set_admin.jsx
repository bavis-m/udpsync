import { createBasePage } from './base_page.jsx';

import { Button, Grid, FormControl, TextField } from '@mui/material';
import React from 'react';

createBasePage(
    <FormControl component="form" fullWidth action="do_set_password" method="post">
        <Grid container direction="column" spacing={1}>        
            <Grid item><TextField fullWidth variant="outlined" type="password" label="Admin password"/></Grid>
            <Grid item><Button fullWidth variant="contained" type="submit">Set Admin Password</Button></Grid>
        </Grid>
    </FormControl>
);