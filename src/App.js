import React from 'react';
import './App.css';
import allFilmsUnfiltered from "./films";
import { shuffle } from "lodash";
import { Card, CardMedia, CardActionArea, Button, Grid, Container, TableCell, Box, CardActions, CardContent, Typography, TableContainer, Table, TableHead, TableRow, TableBody } from "@material-ui/core";
import CachedIcon from "@material-ui/icons/Cached";
import DoneIcon from "@material-ui/icons/Done";
import CloseIcon from "@material-ui/icons/Close";
import moment from "moment";

const allFilms = allFilmsUnfiltered.filter(film => film.original_language == 'en' && !film.genre_ids.includes(16))

const getUserscores = () => {
  return JSON.parse(window.localStorage.getItem('scores') || '[]') || [];
}

const setUserscores = (userScores, user, points, setUserScores) => {
  const scores = [...userScores, [user, points]];
  setUserScores(scores);
  window.localStorage.setItem('scores', JSON.stringify(scores));
}

function App() {

  const [user, setUser] = React.useState("");
  const [showYear, setShowYear] = React.useState("");
  const [queryOlliesAlogrith, setQueryOlliesAlogrith] = React.useState(false);
  const [numberofTurnsLeft, setNumberofTurns] = React.useState();
  const [[on, correct] = [], setShowFeedback] = React.useState();
  const [userScores, setUserScores] = React.useState(getUserscores());
  const [points, setPoints] = React.useState(0);
  const [films, setFilms] = React.useState([]);

  React.useEffect(() => {
    if (numberofTurnsLeft === 0) {
      alert(`User: ${user} finished with ${points} points`);
      setUser();
      setFilms([]);
      setShowFeedback();
      setQueryOlliesAlogrith(false);
      setUserscores(userScores, user, points, setUserScores);
    }
  }, [numberofTurnsLeft])

  const setInitialGame = () => {
    const _user = window.prompt("Enter user");
    setUser(_user);
    setPoints(0);
    setNumberofTurns(10);
    setQueryOlliesAlogrith(false);
    newFilms();
  }

  const newFilms = () => {
    const shuffledFilms = shuffle(allFilms);
    const firstFilm = shuffledFilms[0];
    const filmYear = moment(shuffledFilms[0].release_date).year();
    const plus10 = filmYear + 5;
    const minus10 = filmYear - 5;
    const secondFilm = shuffledFilms.slice(1).find(film => moment(film.release_date).year() < plus10 && moment(film.release_date).year() > minus10);
    setFilms([firstFilm, secondFilm]);
  }

  const refreshFilm = (index) => {
    newFilms();
  }

  const checkIsRight = (index) => {
    let correct = false;
    if (index === 0) {
      correct = moment(films[0].release_date, 'YYYY-MM-DD').isBefore(films[1].release_date);
    }
    if (index === 1) {
      correct = moment(films[1].release_date, 'YYYY-MM-DD').isBefore(films[0].release_date);
    }
    setPoints(correct ? points + 100 : points - 100);
    setShowYear(true);
    setNumberofTurns(numberofTurnsLeft - 1);
    setShowFeedback([index, correct]);
  }

  const next = () => {
    newFilms();
    setShowFeedback();
    setShowYear(false);
    setQueryOlliesAlogrith(false);
  }

  return (
    <Container style={{ padding: '40px' }}>
      <Grid container spacing={5}>
        {films.map((film, index) =>
          <Grid key={film.id} item xs={6}>
            <Card>
              <CardActionArea>
                <CardMedia component="img" image={film.poster_path} height="800" />
                <Box position="absolute" right="10px" top="10px" style={{ background: "white" }} padding="20px" height="20px" height="20px" onClick={() => refreshFilm(index)}>
                  <CachedIcon />
                </Box>
                {typeof on !== 'undefined' && on === index &&
                  <Box position="absolute" right="0" top="0" bottom="0" left="0" height="100%" padding="20px" height="20px" height="20px" onClick={() => refreshFilm(index)}>
                    {correct ? <DoneIcon fontSize="large" style={{ color: 'green', fontSize: '130px' }} /> : <CloseIcon fontSize="large" color="error" style={{ fontSize: '130px' }} />}
                  </Box>
                }
              </CardActionArea>
              <CardContent>
                {showYear && queryOlliesAlogrith && (<Typography variant="h5">
                  {moment(film.release_date, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                </Typography>)}
                <Typography variant="h5">
                  {film.title}
                </Typography>
                <Typography variant="body2">
                  {film.overview}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="large" color="primary" onClick={() => checkIsRight(index)}>
                  Select
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}



        {films.length > 0 && (
          <Box padding="20px">
            <Typography variant="h4">
              User: {user}
            </Typography>
            <Typography variant="h4">
              Points: {points}
            </Typography>
            <Typography variant="h4">
              Remaining: {numberofTurnsLeft}
            </Typography>
          </Box>
        )}

        {typeof on !== 'undefined' && (
          <Box width="100%" display="flex" alignItems="center" justifyContent="center" p="20px">
            <Button size="large" color="primary" variant="contained" onClick={() => next()}>
              Next
          </Button>
          </Box>)}

      {typeof on !== 'undefined' && (
        <Box width="100%" display="flex" alignItems="center" justifyContent="center" p="0px">
          <Button size="large" color="primary" variant="contained" onClick={() => setQueryOlliesAlogrith(!queryOlliesAlogrith)}>
            {!queryOlliesAlogrith ? 'Query ollies game' : 'It was right!' }
        </Button>
        </Box>)}

        {films.length === 0 && (
          <Box width="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center" p="50px">
            <Box width="100%" display="flex" alignItems="center" justifyContent="center" p="50px">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Team</TableCell>
                      <TableCell>Points</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userScores.map(([user, points], index) => (
                      <TableRow key={index}>
                        <TableCell>{user || '-'}</TableCell>
                        <TableCell>{points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            <Button size="large" color="primary" variant="contained" onClick={setInitialGame}>
              Play
            </Button>
          </Box>)}
      </Grid>
    </Container >
  );
}

export default App;
