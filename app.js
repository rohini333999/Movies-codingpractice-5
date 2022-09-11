const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
// API 1
const getMovieList = (dbObject) => {
  return { movieName: dbObject.movie_name };
};
app.get("/movies/", async (request, response) => {
  let getMoviesQuery = `
    SELECT * FROM movie`;
  const getMoviesResponse = await db.all(getMoviesQuery);
  response.send(
    getMoviesResponse.map((eachArrary) => getMovieList(eachArrary))
  );
});
//api 2
app.post("/movies", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovie = `
  INSERT INTO movie (director_id,movie_name,lead_actor)
  VALUES (${directorId}, "${movieName}" ," ${leadActor})"`;
  const postResponse = await db.run(postMovie);
  response.send("Movie Successfully Added");
});

// api3
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie
    WHERE movie_id = ${movieId}`;
  const getMovieResponse = await db.get(getMovieQuery);
  response.send(
    `movieId: ${getMovieResponse.movie_id},
         directorId: ${getMovieResponse.director_id},
         movieName: "${getMovieResponse.movie_name}",
         leadActor: "${getMovieResponse.lead_actor}"`
  );
});
//api 4
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovie = `UPDATE movie 
    SET
    director_id = ${directorId},
    movie_name = "${movieName}",
    lead_actor = "${leadActor}"
    WHERE
    movie_id = ${movieId}`;
  await db.run(updateMovie);
  response.send("Movie Details Updated");
});

// api5
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `DELETE FROM movie WHERE movie_id = ${movieId}`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

// api 6

const directorList = (eachArr) => {
  return {
    directorId: eachArr.director_id,
    directorName: eachArr.director_name,
  };
};
app.get("/directors", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director`;
  const getDirectorRes = await db.all(getDirectorsQuery);
  response.send(getDirectorRes.map((eachArr) => directorList(eachArr)));
});
// API 7
const movieNamefun = (eachobject) => {
  return {
    movieName: eachobject.movie_name,
  };
};
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieDirector = ` SELECT * FROM movie 
    WHERE director_id = ${directorId}`;
  const getResponse = await db.all(getMovieDirector);
  response.send(getResponse.map((eachobject) => movieNamefun(eachobject)));
});

module.exports = app;
