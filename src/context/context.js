import React, { useState, useEffect } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";

const rootUrl = "https://api.github.com";

const GithubContext = React.createContext();

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);
  const [requests, setRequests] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ show: false, msg: "" });

  const checkRequests = async () => {
    try {
      const data = await axios(`${rootUrl}/rate_limit`);
      console.log(data);
      let {
        data: {
          rate: { remaining },
        },
      } = data;
      setRequests(remaining);
      if (remaining === 0) {
        toggleError(true, "Request limit exceeded");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const searchGithubUser = async (user) => {
    toggleError();
    setLoading(true);
    const response = await axios(`${rootUrl}/users/${user}`).catch((err) =>
      console.log(err)
    );

    if (response) {
      const { login, followers_url } = response.data;

      Promise.allSettled([
        axios(`${rootUrl}/users/${login}/repos?per_page=100`),
        axios(`${followers_url}?per_page=100`),
      ])
        .then((results) => {
          const [repos, followers] = results;

          if (repos.status === "fulfilled") setRepos(repos.value.data);
          if (followers.status === "fulfilled")
            setFollowers(followers.value.data);
        })
        .catch((error) => console.log(error));

      setGithubUser(response.data);
    } else {
      toggleError(true, "There is no user with that username");
    }
    checkRequests();
    setLoading(false);
  };

  function toggleError(show = false, msg = "") {
    setError({ show, msg });
  }

  useEffect(() => {
    checkRequests();
  }, []);

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        error,
        searchGithubUser,
        loading,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export { GithubContext, GithubProvider };
