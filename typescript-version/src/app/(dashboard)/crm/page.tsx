'use client'
import React from 'react'
import Grid from '@mui/material/Grid'
import styles from './styles.module.css'
import './styles.scss'
import Award from '@views/dashboard/Award'
import CommonCard from '@views/crm/CommonCard';
import Table from '@views/dashboard/Table'
export default function page() {






  return (
    <div>
      <Grid container spacing={6}>
        <Grid item xs={12} md={4}>
          {/* <Award /> */}
          <CommonCard />
        </Grid>
        <Grid item columns={8} xs={24}>
          <Table />
        </Grid>

      </Grid>

      {/* <div className={styles.buttonInner}>{222}</div> */}
      {/* <div className='buttonInner'>{222}</div> */}
    </div>
  )
}
