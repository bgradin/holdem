/* eslint-disable global-require */
import * as React from 'react';

interface CardSvgs {
  [key: string]: () => any;
}

const svgs: CardSvgs = {
  '2C': require('../../images/cards/2C.svg').default,
  '2D': require('../../images/cards/2D.svg').default,
  '2H': require('../../images/cards/2H.svg').default,
  '2S': require('../../images/cards/2S.svg').default,
  '3C': require('../../images/cards/3C.svg').default,
  '3D': require('../../images/cards/3D.svg').default,
  '3H': require('../../images/cards/3H.svg').default,
  '3S': require('../../images/cards/3S.svg').default,
  '4C': require('../../images/cards/4C.svg').default,
  '4D': require('../../images/cards/4D.svg').default,
  '4H': require('../../images/cards/4H.svg').default,
  '4S': require('../../images/cards/4S.svg').default,
  '5C': require('../../images/cards/5C.svg').default,
  '5D': require('../../images/cards/5D.svg').default,
  '5H': require('../../images/cards/5H.svg').default,
  '5S': require('../../images/cards/5S.svg').default,
  '6C': require('../../images/cards/6C.svg').default,
  '6D': require('../../images/cards/6D.svg').default,
  '6H': require('../../images/cards/6H.svg').default,
  '6S': require('../../images/cards/6S.svg').default,
  '7C': require('../../images/cards/7C.svg').default,
  '7D': require('../../images/cards/7D.svg').default,
  '7H': require('../../images/cards/7H.svg').default,
  '7S': require('../../images/cards/7S.svg').default,
  '8C': require('../../images/cards/8C.svg').default,
  '8D': require('../../images/cards/8D.svg').default,
  '8H': require('../../images/cards/8H.svg').default,
  '8S': require('../../images/cards/8S.svg').default,
  '9C': require('../../images/cards/9C.svg').default,
  '9D': require('../../images/cards/9D.svg').default,
  '9H': require('../../images/cards/9H.svg').default,
  '9S': require('../../images/cards/9S.svg').default,
  '10C': require('../../images/cards/10C.svg').default,
  '10D': require('../../images/cards/10D.svg').default,
  '10H': require('../../images/cards/10H.svg').default,
  '10S': require('../../images/cards/10S.svg').default,
  JC: require('../../images/cards/JC.svg').default,
  JD: require('../../images/cards/JD.svg').default,
  JH: require('../../images/cards/JH.svg').default,
  JS: require('../../images/cards/JS.svg').default,
  QC: require('../../images/cards/QC.svg').default,
  QD: require('../../images/cards/QD.svg').default,
  QH: require('../../images/cards/QH.svg').default,
  QS: require('../../images/cards/QS.svg').default,
  KC: require('../../images/cards/KC.svg').default,
  KD: require('../../images/cards/KD.svg').default,
  KH: require('../../images/cards/KH.svg').default,
  KS: require('../../images/cards/KS.svg').default,
  AC: require('../../images/cards/AC.svg').default,
  AD: require('../../images/cards/AD.svg').default,
  AH: require('../../images/cards/AH.svg').default,
  AS: require('../../images/cards/AS.svg').default,
};

interface CardProps {
  code: string;
}

export default function Card({ code }: CardProps) {
  const svg = svgs[code];
  if (!svg) {
    console.error(`Could not find code ${code}`);
  }

  return (
    <div className="card">
      {svg()}
    </div>
  );
}
