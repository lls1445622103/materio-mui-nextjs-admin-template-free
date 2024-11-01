import React from 'react'
import { CardActions, Button, CardHeader, CardContent, Card, Avatar, CardMedia, Typography } from '@mui/material';
import { red } from '@mui/material/colors';
export default function CommonCard() {
  return (
    <Card raised classes={{
      root: 'sss'
    }}>
      <CardMedia
        component="img"
        alt="green iguana"
        height="140"
        image="https://v5.mui.com/static/images/cards/contemplative-reptile.jpg"
      />
      <CardHeader
        // avatar={
        //   <Avatar
        //     sx={{ bgcolor: red[100] }}
        //     aria-label="recipe">
        //     R
        //   </Avatar>
        // }
        title='CommonCard' />
      <CardContent>

        <Typography variant='h5'>Congratulations John! 🎉</Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Share</Button>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  )
}
