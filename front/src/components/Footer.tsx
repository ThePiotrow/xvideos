import { Container, Typography, Link, Grid, Divider } from "@mui/material";

function Footer() {
  return (
    <footer style={{ backgroundColor: '#ffffff' }}>
      <Container maxWidth="lg">
        <Divider style={{ margin: '24px 0' }} />

        <Grid container spacing={5}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="textPrimary">Quick Link</Typography>
            <Link href="#" color="textSecondary" display="block" style={{ marginTop: '16px' }}>Home</Link>
            <Link href="#" color="textSecondary" display="block">Who We Are</Link>
            <Link href="#" color="textSecondary" display="block">Our Philosophy</Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="textPrimary">Industries</Typography>
            <Link href="#" color="textSecondary" display="block" style={{ marginTop: '16px' }}>Retail & E-Commerce</Link>
            <Link href="#" color="textSecondary" display="block">Information Technology</Link>
            <Link href="#" color="textSecondary" display="block">Finance & Insurance</Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="textPrimary">Services</Typography>
            <Link href="#" color="textSecondary" display="block" style={{ marginTop: '16px' }}>Translation</Link>
            <Link href="#" color="textSecondary" display="block">Proofreading & Editing</Link>
            <Link href="#" color="textSecondary" display="block">Content Creation</Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="textPrimary">Contact Us</Typography>
            <Link href="#" color="textSecondary" display="block" style={{ marginTop: '16px' }}>+880 768 473 4978</Link>
            <Link href="#" color="textSecondary" display="block">info@merakiui.com</Link>
          </Grid>
        </Grid>

        <Divider style={{ margin: '24px 0' }} />

        <Grid container>
          <Grid item>
            <Typography variant="body2" color="textSecondary">
              © Copyright 2021. All Rights Reserved.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </footer>
  );
}

export default Footer;
