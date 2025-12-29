// ShimmerHeading.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';
import { G_Wrapper } from "../LICENSE_O_S/LicenseGuard/ui_G.tsx";
import { useComponentGuard } from "../LICENSE_O_S/LicenseGuard/useComponent_G.ts";

interface ShimmerHeadingProps {
    headingText: string;
    subHeadingText: string;
}

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const ShimmerHeading: React.FC<ShimmerHeadingProps> = ({ headingText, subHeadingText }) => {
    const GS = useComponentGuard();

    return (
        <G_Wrapper State_G={GS}>
            <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 800,
                        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                        background: 'linear-gradient(135deg, #d04200 0%, #ff9900 50%, #dac800fc 100%)',
                        backgroundSize: '200% 100%',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: `${shimmer} 3s linear infinite`,
                        mb: 2,
                        mt: { xs: 4, sm: 4, md: 4, lg: 5 },
                    }}
                >
                    {headingText}
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        color: '#666',
                        fontSize: '1.1rem',
                        fontFamily: 'eReg',
                    }}
                >
                    {subHeadingText}
                </Typography>
            </Box>
    </G_Wrapper>
    );
};

export {ShimmerHeading};
