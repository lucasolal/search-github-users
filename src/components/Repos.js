import React from "react";
import styled from "styled-components";
import { GithubContext } from "../context/context";
import { Pie3D, Column3D, Bar3D, Doughnut2D } from "./Charts";
const Repos = () => {
  const { repos } = React.useContext(GithubContext);

  const languageCounterReducer = (counter, repo) => {
    const { language, stargazers_count } = repo;

    if (!language) return counter;

    if (!counter[language])
      counter[language] = {
        label: language,
        value: 1,
        stars: stargazers_count,
      };
    else {
      counter[language].value += 1;
      counter[language].stars += stargazers_count;
    }

    return counter;
  };

  let languageCount = repos.reduce(languageCounterReducer, {});

  let mostUsedSorted = Object.values(languageCount)
    .sort((obj1, obj2) => (obj1.value < obj2.value ? 1 : -1))
    .slice(0, 5);

  let mostStarsSorted = Object.values(languageCount)
    .sort((obj1, obj2) => (obj1.stars < obj2.stars ? 1 : -1))
    .slice(0, 5)
    .map((elem) => ({ ...elem, value: elem.stars }));

  let { stars, forks } = repos.reduce(
    (acc, repo) => {
      const { stargazers_count, name, forks } = repo;
      acc.stars[stargazers_count] = { label: name, value: stargazers_count };
      acc.forks[forks] = { label: name, value: forks };

      return acc;
    },
    { stars: {}, forks: {} }
  );

  stars = Object.values(stars).slice(-5).reverse();
  forks = Object.values(forks).slice(-5).reverse();

  return (
    <section className='section'>
      <Wrapper className='section-center'>
        <Pie3D data={mostUsedSorted} />
        <Doughnut2D data={mostStarsSorted} />
        <Column3D data={stars} />
        <Bar3D data={forks} />
      </Wrapper>
    </section>
  );
};

const Wrapper = styled.div`
  display: grid;
  justify-items: center;
  gap: 2rem;
  @media (min-width: 800px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: 1200px) {
    grid-template-columns: 2fr 3fr;
  }

  div {
    width: 100% !important;
  }

  fusioncharts-container {
    width: 100% !important;
  }

  svg {
    width: 100% !important;
    border-radius: var(--radius);
  }
`;

export default Repos;
