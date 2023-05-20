import { createBasePage } from './base_page.jsx';

import { Button, Grid, FormControl, TextField, Card, CardHeader, CardContent, Typography } from '@mui/material';
import React from 'react';

createBasePage(
    <Card sx={{p:3}}>
        <CardHeader title={window.initial_data.authed_user} />
        <CardContent>
            <FormControl component="form" fullWidth action="do_set_password" method="post">
                <Grid container direction="column" spacing={1}>
                    <Grid item><TextField fullWidth variant="outlined" type="password" name="old_password" label="Old Password" autoFocus/></Grid>
                    <Grid item><TextField fullWidth variant="outlined" type="password" name="new_password" label="New Password"/></Grid>
                    <Grid item><TextField fullWidth variant="outlined" type="password" name="new_password2" label="Confirm New Password"/></Grid>
                    <Grid item><Button fullWidth variant="contained" type="submit">Change Password</Button></Grid>
                </Grid>
            </FormControl>
        </CardContent>
    </Card>
);