import React from 'react';
import { gridData } from '../Database/data';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import './Grid.css';
import Container from './Container';
import Full from './Full';

const Grid = ({grids}) => {
  return (
    <div className="new_row">
      {grids.map((grid) => (
        <Container id={grid.id} link={grid.link} name={grid.name} />
      ))}
      {Object.keys(grids).length === 0 && (
        <h2 style={{ margin: "100px 250px", color: "#222" }}>
          No match found!
        </h2>
      )}
    </div>
  );
 }
  


export default Grid
