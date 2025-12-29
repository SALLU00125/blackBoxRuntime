// components/GuardUI.tsx
// 🔒 Reusable UI components for guarded content

import React from 'react';
import { Box, Typography, Container, CircularProgress } from '@mui/material';

// ============= LOADING DISPLAY =============
export const LoadingDisplay_G: React.FC = () => (
    <Container
        maxWidth="xl"
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '68vh',
        }}
    >
        <CircularProgress />
    </Container>
);

// ============= RESTRICTION DISPLAY =============
interface RstDisplayProps {
    content: {
        title?: string;
        message?: string;
        contact?: string;
    };
}

export const RstDisplay_G: React.FC<RstDisplayProps> = ({ content }) => (
    <Container
        maxWidth="xl"
        sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '68vh',
            background: 'linear-gradient(135deg, #fff5f5 0%, #ffe0e0 100%)',
            border: '10px solid #ff4444',
            borderRadius: '24px',
            p: 4,
        }}
    >
        <Box sx={{ textAlign: 'center', maxWidth: '500px' }}>
            <Typography
                variant="h3"
                sx={{
                    color: '#d32f2f',
                    fontWeight: 700,
                    mb: 4,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                }}
            >
                {content?.title || 'Access Restricted'}
            </Typography>
            <Typography
                variant="body1"
                sx={{
                    color: '#c62828',
                    fontSize: '1.8rem',
                    lineHeight: 1.8
                }}
            >
                {content?.message || 'This component is currently unavailable.'}
            </Typography>
            {content?.contact && (
                <Typography
                    variant="body2"
                    sx={{
                        color: '#e57373',
                        fontSize: '1.5rem',
                        mt: 5
                    }}
                >
                    {content.contact}
                </Typography>
            )}
        </Box>
    </Container>
);

// ============= GUARD WRAPPER HOC =============
interface G_WrapperProps {
    State_G: {
        ready: boolean;
        access: boolean;
        content: any;
    };
    children: React.ReactNode;
    loadingComponent?: React.ReactNode;
    rst_Component?: React.ReactNode;
}

export const G_Wrapper: React.FC<G_WrapperProps> = ({
                                                              State_G,
                                                              children,
                                                              loadingComponent,
                                                              rst_Component
                                                          }) => {
    // Show loading state
    if (!State_G.ready) {
        return <>{loadingComponent || <LoadingDisplay_G />}</>;
    }

    // Show restriction if access denied
    if (!State_G.access) {
        if (rst_Component) {
            return <>{rst_Component}</>;
        }

        return (
            <RstDisplay_G
                content={State_G.content || {
                    title: 'Access Restricted',
                    message: 'This component is currently unavailable.',
                    contact: null
                }}
            />
        );
    }

    // Show actual content
    return <>{children}</>;
};