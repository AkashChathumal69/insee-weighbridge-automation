import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'About',
      links: [
        { label: 'Who We Are', href: '#' },
        { label: 'Missions', href: '#' },
        { label: 'History', href: '#' },
      ],
    },
    {
      title: 'Services',
      links: [
        { label: 'Data & Statistics', href: '#' },
        { label: 'Research', href: '#' },
        { label: 'Reports', href: '#' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '#' },
        { label: 'Download Data', href: '#' },
        { label: 'API Access', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Use', href: '#' },
        { label: 'Cookie Policy', href: '#' },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#003d82',
        color: 'white',
        mt: 8,
      }}
    >
      {/* Main Footer Content */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: '1.3rem',
              }}
            >
              INSEE
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                mb: 2,
                lineHeight: 1.8,
              }}
            >
              Institut National de la Statistique et des Études Économiques.
              Providing statistical and economic insights for informed decision-making.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Link href="#" color="inherit" sx={{ '&:hover': { opacity: 0.7 } }}>
                <FacebookIcon />
              </Link>
              <Link href="#" color="inherit" sx={{ '&:hover': { opacity: 0.7 } }}>
                <TwitterIcon />
              </Link>
              <Link href="#" color="inherit" sx={{ '&:hover': { opacity: 0.7 } }}>
                <LinkedInIcon />
              </Link>
              <Link href="#" color="inherit" sx={{ '&:hover': { opacity: 0.7 } }}>
                <EmailIcon />
              </Link>
            </Box>
          </Grid>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <Grid item xs={12} sm={6} md={2.25} key={section.title}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  fontSize: '0.95rem',
                }}
              >
                {section.title}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#ffb300',
                        paddingLeft: '4px',
                      },
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Bottom Footer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.85rem',
            }}
          >
            © {currentYear} INSEE. All rights reserved.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.85rem',
            }}
          >
            Designed & Developed with precision for statistical excellence
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
