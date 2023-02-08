const express = require("express");
const path = require("path");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertFunction = (dbResponse) => {
  return {
    movieName: dbResponse.movie_name,
  };
};

const convertFunction2 = (dbResponse) => {
  return {
    movieId: dbResponse.movie_id,
    directorId: dbResponse.director_id,
    movieName: dbResponse.movie_name,
    leadActor: dbResponse.lead_actor,
  };
};

//API 1

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
    movie_name
    FROM 
    movie;
    `;
  const movieList = await db.all(getMoviesQuery);
  response.send(movieList.map((eachMovie) => convertFunction(eachMovie)));
});

//API 2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
    movie (director_id, movie_name, lead_actor)
    VALUES (${directorId}, "${movieName}", "${leadActor}");
    `;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
    *
    FROM
    movie
    WHERE
    movie_id = ${movieId};
    `;
  const movie = await db.get(getMovieQuery);
  response.send(convertFunction2(movie));
});

//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const { movieId } = request.params;
  const updateMovieQuery = `
    UPDATE
    movie
    SET
    director_id = ${directorId},
    movie_name = "${movieName}",
    lead_actor = "${leadActor}"
    WHERE
    movie_id = ${movieId};
    `;
  const updateRequest = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
    movie
    WHERE
    movie_id = ${movieId};
    `;
  const deleteRequest = db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertDirector = (dbResponse) => {
  return {
    directorId: dbResponse.director_id,
    directorName: dbResponse.director_name,
  };
};

//API 6

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT 
    *
    FROM
    director;
    `;
  const director = await db.all(getDirectorsQuery);
  response.send(director.map((eachDirector) => convertDirector(eachDirector)));
});

//API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const movieDirectorQuery = `
    SELECT 
    movie_name
    FROM 
    movie
    WHERE
    director_id = ${directorId};
    `;
  const movieDirectorList = await db.all(movieDirectorQuery);
  response.send(
    movieDirectorList.map((eachMovie) => convertFunction(eachMovie))
  );
});

module.exports = app;
