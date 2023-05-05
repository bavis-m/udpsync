import { createBasePage } from './base_page.jsx';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography,
    Card,
    CardHeader,
    CardContent
} from '@mui/material';

import { ExpandMore } from '@mui/icons-material';

import React, { useState } from 'react';

const SyncDir = ({syncDir}) => <div>Sync Dir</div>

const SyncDirs = (props) =>
{
    const [syncDirs, setSyncDirs] = useState(window.initial_data.sync_dirs || []);    
    return syncDirs.map(s =>
        <Accordion key={s.id}>
            <AccordionSummary expandIcon={<ExpandMore/>}><Typography>Blah</Typography></AccordionSummary>
            <AccordionDetails>
                <SyncDir syncDir={s}/>
            </AccordionDetails>
        </Accordion>
    );
}

const Host = ({host}) => <div>{host.user}@{host.host}</div>

const Hosts = (props) =>
{
    const [hosts, setHosts] = useState(window.initial_data.hosts || []);    
    return hosts.map(h =>
        <Accordion key={h.id}>
            <AccordionSummary expandIcon={<ExpandMore/>}><Typography>{h.user}@{h.host}</Typography></AccordionSummary>
            <AccordionDetails>
                <Host host={h}/>
            </AccordionDetails>
        </Accordion>
    );
}

createBasePage(
    <>
        <Card sx={{p:3}}>
            <CardHeader title="Hosts" />
            <CardContent>
                <Hosts/>
            </CardContent>
        </Card>
        <Card sx={{p:3, mt:2}}>
            <CardHeader title="Synced Directories" />
            <SyncDirs/>
        </Card>
    </>
);