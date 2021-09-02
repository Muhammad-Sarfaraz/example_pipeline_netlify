import React, { useState, useEffect } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";

const rootUrl = "https://api.github.com";

const GithubContext = React.createContext();

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubuser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);
  const [request, setRequest] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ show: false, msg: "" });

  const serachGithubUser = async (user) => {
    // toggleError
    toggleError();
    setLoading(true);
    const response = await axios(`${rootUrl}/users/${user}`).catch((err) => {
      console.log(err);
    });

    if (response) {
      setGithubuser(response.data);
      const {login,followers_url}=response.data;

      // repos
      axios(`${rootUrl}/users/${login}/repos?per_page=100`)
      .then((response)=>{
       setRepos(response.data);
      });

      // followers
      axios(`${followers_url}?per_page=100`)
      .then((response)=>{
       setFollowers(response.data)
      });
    } else {
      toggleError(true, "No user found!");
    }

    checkRequests();
    setLoading(false);
    console.log(response);
  };

  // check request
  const checkRequests = () => {
    axios(`${rootUrl}/rate_limit`)
      .then((data) => {
        let remaining = data.data.rate.remaining;
        if (remaining === 0) {
          toggleError(true, "sorry,you have reached rate limit");
        }
        setRequest(remaining);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  function toggleError(show = false, msg = "") {
    setError({ show, msg });
  }

  useEffect(checkRequests, []);

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        request,
        error,
        serachGithubUser,
        loading,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export { GithubProvider, GithubContext };
