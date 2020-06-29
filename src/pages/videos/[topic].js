import Layout, { siteTitle } from "../../components/layout";
import fetch from "node-fetch";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import React, { useState, useEffect, useRef } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import SkipPreviousIcon from "@material-ui/icons/SkipPrevious";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import Head from "next/head";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: "1 0 auto",
  },
  cover: {
    width: 151,
  },
  controls: {
    display: "flex",
    alignItems: "center",
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  playIcon: {
    height: 38,
    width: 38,
  },
}));

function MediaControlCard({ video }) {
  const { thumbnail, title, channel, vid } = video;
  const classes = useStyles();
  const theme = useTheme();

  return (
    <Grid container wrap="nowrap">
      <Box key={vid} width={210} marginRight={0.5} my={5}>
        <img style={{ width: 210, height: 118 }} alt={title} src={thumbnail} />
        <Box pr={2}>
          <Typography gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography display="block" variant="caption" color="textSecondary">
            {channel}
          </Typography>
          <IconButton aria-label="play/pause">
            <PlayArrowIcon className={classes.playIcon} />
          </IconButton>
        </Box>
      </Box>
    </Grid>
  );
}
export default function Topic(props) {
  console.log(props);
  const intervalRef = useRef();

  const [videos, setVideos] = useState([]);
  useEffect(() => {
    async function fetchProduct() {
      const response = await fetch("/api/yt?query=" + props.query);
      const json = await response.json();
      setVideos(json);
    }
    fetchProduct();
  }, []);

  return (
    <Layout>
      <Head></Head>
      <Box overflow="hidden">
        {videos.map((v) => (
          <MediaControlCard key={v.vid} video={v} />
        ))}
      </Box>
    </Layout>
  );
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {
      query: params.topic,
    },
  };
}
