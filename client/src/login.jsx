import { createBasePage } from './base_page.jsx';

import {
    Button,
    Grid,
    Card,
    FormControl,
    TextField,
    CardHeader,
    CardContent
} from '@mui/material';
import React from 'react';

const searchParams = new URLSearchParams(document.location.search);

createBasePage(
    <Card sx={{p:3}}>
        <CardHeader title="Login" />
        <CardContent>
            <FormControl component="form" fullWidth action="do_login" method="post">
                    { searchParams.has("redirect") && <input type="hidden" name="redirect" value={searchParams.get("redirect")}></input> }
                    <Grid container direction="column" spacing={1}>
                    <Grid item><TextField fullWidth variant="outlined" label="User Name" type="text" name="user" autoFocus/></Grid>
                    <Grid item><TextField fullWidth variant="outlined" label="Password" type="password" name="password" /></Grid>
                    <Grid item><Button fullWidth variant="contained" type="submit">Login</Button></Grid>
                </Grid>
            </FormControl>
            </CardContent>
    </Card>
);