import { createBasePage } from './base_page.jsx';

import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Typography
} from '@mui/material';

import React, { useState } from 'react';

const SyncDir = ({syncDir}) => <div>Sync Dir</div>

const SyncDirs = (props) =>
{
    const [syncDirs, setSyncDirs] = useState(window.initial_data.sync_dirs || []);    
    return syncDirs.map(s =>
        <Accordion key={s.id}>
            <AccordionSummary><Typography>Blah</Typography></AccordionSummary>
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
            <AccordionSummary><Typography>{h.user}@{h.host}</Typography></AccordionSummary>
            <AccordionDetails>
                <Host host={h}/>
            </AccordionDetails>
        </Accordion>
    );
}

createBasePage(
    <>
        <Hosts/>
        <SyncDirs/>
    </>
);