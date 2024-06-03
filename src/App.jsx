import { useParams } from 'react-router-dom';
import { useCallback, useRef, useState, useEffect } from 'react';

import ReactPlayer from 'react-player';
import { Duration, format } from './Duration';
import { useKonami } from 'react-konami-code';
import { motion } from 'framer-motion';
import './app.css';

import cross from './assets/deathCross.png';
import imageOtfgk from './assets/otfgk.png';
import deathMp from './assets/deathshort.aac';
import otfgkMp from './assets/otfgk.aac';
import Themes from './ThemeData';

function App() {
  const playerRef = useRef();
  const contentRef = useRef();
  let {
    colorWay,
    reactUrl,
    reactStart,
    talUrl,
    talStart,
    playPause,
    extraContentParam,
  } = useParams();

  const [reactorUrl, setReactorUrl] = useState(
    'https://www.youtube.com/watch?v=LXb3EKWsInQ'
  );
  const [talenturl, setTalentUrl] = useState(
    'https://www.youtube.com/watch?v=LXb3EKWsInQ'
  );
  const [talentUrlInputValue, settalentUrlInputValue] = useState(
    'https://www.youtube.com/watch?v=LXb3EKWsInQ'
  );
  const [talentStartInputValue, setTalentStartInputValue] = useState('0:10');

  const [playing, setPlaying] = useState(false);
  const [talentPlaying, setTalentPlaying] = useState(false);
  const [talentStart, setTalentStart] = useState('0:10');
  const [reactorStart, setReactorStart] = useState('0:00');
  const [played, setPlayed] = useState(1);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [ignoreParams, setIgnoreParams] = useState(false);
  const [errorTalentStart, setErrorTalentStart] = useState(false);
  const [errorReactorStart, setErrorReactorStart] = useState(false);
  const [contentStart, setContentStart] = useState('');
  const [isContentReady, setIsContentReady] = useState(false);

  const [sharelink, setSharelink] = useState();

  //pause resume state

  const [pauseSection, setPauseSection] = useState(false);

  const [reactorPauseResume, setReactorPauseResume] = useState([
    { pause: '', resume: '' },
  ]);

  const [errorReactorPauseResume, setErrorReactorPauseResume] = useState();

  const [extraContentSection, setExtraContentSection] = useState(false);

  const [extraContent, setExtraContent] = useState([{ start: '', url: '' }]);

  const [errorExtraContentStart, setErrorExtraContentStart] = useState();

  //theme state
  const [themeBM, setThemeBM] = useState();

  //Motion state
  const [showCard, setShowCard] = useState(false);
  const [motionInitial, setMotionInitial] = useState();
  const [motionInView, setMotionInView] = useState();
  const [motionAnimate, setMotionAnimate] = useState();
  const [motionTransition, setMotionTransition] = useState();

  //setThemeBM(false);

  const [theme, setTheme] = useState(Themes.default);

  const regNum = /^\d+:\d{2,2}$/;

  //pull data from url
  const handelParams = () => {
    let resPausePlay;
    let resExtraConent;

    //check for undefined before parsing json
    if (playPause === undefined) {
      resPausePlay = undefined;
    } else {
      resPausePlay = JSON.parse(playPause);
    }

    if (extraContentParam === undefined) {
      resExtraConent = undefined;
    } else {
      resExtraConent = JSON.parse(extraContentParam);
    }

    //check and set data
    if (
      ignoreParams != true &&
      colorWay != undefined &&
      reactUrl != undefined &&
      reactStart != undefined &&
      talUrl != undefined &&
      talStart != undefined &&
      resPausePlay != undefined &&
      resExtraConent != undefined
    ) {
      setReactorUrl(decodeURIComponent(reactUrl));
      setThemeBM(decodeURIComponent(colorWay));
      setReactorStart(decodeURIComponent(reactStart));
      setTalentUrl(decodeURIComponent(talUrl));
      setTalentStart(decodeURIComponent(talStart));
      settalentUrlInputValue(decodeURIComponent(talUrl));
      setTalentStartInputValue(decodeURIComponent(talStart));
      setReactorPauseResume(resPausePlay);
      setExtraContent(resExtraConent);
    }
  };

  //reactor video play
  const handlePlay = () => {
    setPlaying(true);
  };

  const handlePlayBoth = () => {
    setTalentPlaying(true);
    setPlaying(true);
  };

  // handle reactor Pause
  const handlePause = () => {
    setPlaying(false);
  };

  //content pause
  const handlePauseTalent = () => {
    setTalentPlaying(false);
  };

  const handlePauseBoth = () => {
    handlePause();
    handlePauseTalent();
  };

  // track video progress
  const handleProgress = (progress) => {
    setPlayed(progress.playedSeconds);

    handleTalentplaying(played);
    handleTalentPlayPause(played);
    handleExtraContentLoad(played);
  };

  //start content when reactor time is @
  const handleTalentplaying = (played) => {
    if (format(played + 1) === talentStart) {
      setTalentPlaying(true);
    }
  };

  //pause and play content when pauses added
  const handleTalentPlayPause = (played) => {
    let reactorPause = reactorPauseResume.map((e) => e.pause);
    let reactorResume = reactorPauseResume.map((e) => e.resume);

    reactorPause.forEach((pause) => {
      if (format(played + 1) === pause) {
        setTalentPlaying(false);
      }
    });

    reactorResume.forEach((resume) => {
      if (format(played + 1) === resume) {
        setTalentPlaying(true);
      }
    });
  };

  //handle extra content
  const handleExtraContentLoad = (played) => {
    setIsContentReady(false);
    let extraContentStart = extraContent.map((e) => {
      return [e.start, e.url];
    });

    extraContentStart.forEach((data) => {
      const extraStart = data[0];
      const url = data[1];

      const parts = extraStart.split(':');
      const minutes = parseInt(parts[0], 10) || 0;
      const seconds = parseFloat(parts[1]) || 0;
      const timeToStart = minutes * 60 + seconds;

      if (Math.floor(played + 1) === timeToStart - 10) {
        console.log('10 to start');

        console.log(url);

        handlePauseTalent();

        setTalentUrl(url);

        setTalentStart(extraStart);
        setContentStart('0:00');

        setTimeout(() => {
          onContentReady();
        }, '1000');

        handlePauseTalent();
      }
    });
  };

  //create link
  const handleShare = () => {
    setSharelink(
      `https://mltdwn23.github.io/videolink/#/${encodeURIComponent(
        themeBM
      )}/${encodeURIComponent(reactorUrl)}/${encodeURIComponent(
        reactorStart
      )}/${encodeURIComponent(talentUrlInputValue)}/${encodeURIComponent(
        talentStartInputValue
      )}/${encodeURIComponent(
        JSON.stringify(reactorPauseResume)
      )}/${encodeURIComponent(JSON.stringify(extraContent))} `
    );
  };

  //handle input start time for content
  const handleReactorStart = (e) => {
    setIgnoreParams(true);
    setReactorStart(e.target.value);

    if (!regNum.test(e.target.value)) {
      setErrorReactorStart(true);
    } else {
      setErrorReactorStart(false);
    }
  };

  //handle input start time for content
  const handleTalentStart = (e) => {
    setIgnoreParams(true);
    setTalentStart(e.target.value);
    setTalentStartInputValue(e.target.value);

    if (!regNum.test(e.target.value)) {
      setErrorTalentStart(true);
    } else {
      setErrorTalentStart(false);
    }
  };

  //show hide pause inputs
  const handlePauseSection = () => {
    setPauseSection(!pauseSection);
  };

  //handle pause resume inputs
  const handlePauseResume = (event, index) => {
    let data = [...reactorPauseResume];
    data[index][event.target.name] = event.target.value;
    setReactorPauseResume(data);

    if (!regNum.test(event.target.value)) {
      setErrorReactorPauseResume(true);
    } else {
      setErrorReactorPauseResume(false);
    }
  };

  //add pause resume inputs
  const addFields = (e) => {
    e.preventDefault();

    let object = {
      pause: '',
      resume: '',
    };

    setReactorPauseResume([...reactorPauseResume, object]);
  };

  //remove pause resume inputs
  const removeFields = (index) => {
    let data = [...reactorPauseResume];
    data.splice(index, 1);
    setReactorPauseResume(data);
  };

  //show hide extra content inputs
  const handleExtraContentSection = () => {
    setExtraContentSection(!extraContentSection);
  };

  // let cons che === t

  //handle pause resume inputs
  const handleExtraContent = (event, index) => {
    let data = [...extraContent];
    data[index][event.target.name] = event.target.value;
    setExtraContent(data);

    // console.log(event.target.id);

    if (event.target.id === 'Content Start') {
      if (!regNum.test(event.target.value)) {
        setErrorExtraContentStart(true);
      } else {
        setErrorExtraContentStart(false);
      }
    }
  };

  //add pause resume inputs
  const addExtraContentFields = (e) => {
    e.preventDefault();

    let object = {
      start: '',
      url: '',
    };

    setExtraContent([...extraContent, object]);
  };

  //remove pause resume inputs
  const removeExtraContentFields = (index) => {
    let data = [...extraContent];
    data.splice(index, 1);
    setExtraContent(data);
  };

  //handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    handleShare();
  };

  //start react video @
  const onReady = useCallback(() => {
    setTimeout(() => {
      handlePause();
    }, '1000');

    if (!isReady) {
      const parts = reactorStart.split(':');
      const minutes = parseInt(parts[0], 10) || 0;
      const seconds = parseFloat(parts[1]) || 0;
      const timeToStart = minutes * 60 + seconds;

      playerRef.current.seekTo(timeToStart, 'seconds');
      setIsReady(true);
    }
  });

  //START CONTENT @
  const onContentReady = useCallback(() => {
    setTalentPlaying(true);
    setTimeout(() => {
      handlePauseTalent();
    }, '1000');

    if (!isContentReady) {
      const parts = contentStart.split(':');
      const minutes = parseInt(parts[0], 10) || 0;
      const seconds = parseFloat(parts[1]) || 0;
      const timeToStart = minutes * 60 + seconds;

      //

      contentRef.current.seekTo(timeToStart, 'seconds');
      setIsContentReady(true);
    }
  });

  //theme

  const handleTheme = () => {
    switch (themeBM) {
      case 'bm':
        setTheme(Themes.bm);
        break;
      case 'death':
        setTheme(Themes.death);
        break;
      case 'otfgk':
        setTheme(Themes.otfgk);
        break;
      case 'throne':
        setTheme(Themes.throne);
        break;
      case 'bbab':
        setTheme(Themes.bbab);
        break;
      case 'theone':
        setTheme(Themes.theone);
        break;
      case 'doki':
        setTheme(Themes.doki);
        break;
      case 'megitsune':
        setTheme(Themes.megitsune);
        break;
      case 'momo':
        setTheme(Themes.momo);
        break;
      case 'moa':
        setTheme(Themes.moa);
        break;
      case 'su':
        setTheme(Themes.su);
        break;
      case 'yui':
        setTheme(Themes.yui);
        break;
      case 'bbm':
        setTheme(Themes.bbm);
        break;
      case 'sakura':
        setTheme(Themes.sakura);
        break;
      default:
        setTheme(Themes.default);
    }
  };

  //codes

  //bm toggle

  const BM = ['66', '77'];

  const changeTheme = () => {
    if (themeBM === 'bm') {
      setThemeBM();
    } else {
      setThemeBM('bm');
    }
    setIgnoreParams(true);
    handleTheme();
  };

  useKonami(changeTheme, { code: BM });

  //throne

  const THRONE = ['84', '72', '82', '79', '78', '69'];

  const handleThrone = () => {
    setThemeBM('throne');

    setIgnoreParams(true);
    handleTheme();
  };

  useKonami(handleThrone, { code: THRONE });

  //MOMO

  const MOMO = ['77', '79', '77', '79'];

  const handleMomo = () => {
    setThemeBM('momo');

    setIgnoreParams(true);
    handleTheme();
  };

  useKonami(handleMomo, { code: MOMO });

  //SG

  const SG = ['83', '71'];

  const handleSG = () => {
    setThemeBM('sakura');

    setIgnoreParams(true);
    handleTheme();
  };

  useKonami(handleSG, { code: SG });

  const MOA = ['77', '79', '65'];

  const handleMoa = () => {
    setThemeBM('moa');

    setIgnoreParams(true);
    handleTheme();
  };

  useKonami(handleMoa, { code: MOA });

  //SU
  const SU = ['83', '85', '189'];

  const handleSu = () => {
    setThemeBM('su');

    setIgnoreParams(true);
    handleTheme();
  };

  useKonami(handleSu, { code: SU });

  //YUI
  const YUI = ['89', '85', '73'];

  const handleYui = () => {
    setThemeBM('yui');

    setIgnoreParams(true);
    handleTheme();
  };

  useKonami(handleYui, { code: YUI });

  const BLACK = ['66', '76', '65', '67', '75'];

  const bbmTheme = () => {
    setThemeBM('bbm');

    setIgnoreParams(true);
    handleTheme();
  };

  useKonami(bbmTheme, { code: BLACK });

  //BBAB CODE

  const handleBBAB = () => {
    setReactorUrl('https://www.youtube.com/watch?v=a3xokC9D6yc');
    setTalentUrl('https://www.youtube.com/watch?v=a3xokC9D6yc');
  };

  const BBAB = ['38', '40', '37', '39', '66', '66', '65', '66'];
  const easterEgg = () => {
    setIgnoreParams(true);
    handleBBAB();
    setThemeBM('bbab');
    playerRef.current.player.player.mute();
    handleTheme();
    setTimeout(() => {
      handlePlayBoth();
    }, '2000');
  };
  useKonami(easterEgg, { code: BBAB });

  //DOKI CODE

  const DOKI = ['68', '79', '75', '73'];

  const HandleDoki = () => {
    setIgnoreParams(true);
    setReactorUrl('https://www.youtube.com/watch?v=sx6f0uiUOvA');
    setTalentUrl('https://www.youtube.com/watch?v=10V4-xxYZS4');

    setThemeBM('doki');
    playerRef.current.player.player.mute();
    setReactorStart('0:10');
    setContentStart('0:00');

    handleTheme();

    setIsReady(false);
    setIsContentReady(false);

    setTimeout(() => {
      handlePlayBoth();
      setReactorStart('0:00');
    }, '2000');
  };

  useKonami(HandleDoki, { code: DOKI });

  //KITSUNE MEGITSUNE CODE

  const KITSUNE = ['75', '73', '84', '83', '85', '78', '69'];
  const MEGITSUNE = ['77', '69', '71', '73', '84', '83', '85', '78', '69'];

  const handelMegitsune = () => {
    setIgnoreParams(true);
    setReactorUrl('https://www.youtube.com/watch?v=RorkQ79V-68');
    setTalentUrl('https://www.youtube.com/watch?v=RorkQ79V-68');
    setThemeBM('megitsune');

    handleTheme();
    playerRef.current.player.player.mute();

    setTimeout(() => {
      handlePlayBoth();
    }, '2000');
  };

  useKonami(handelMegitsune, { code: KITSUNE });
  useKonami(handelMegitsune, { code: MEGITSUNE });

  //OTFGK code

  const [audioOtfgk] = useState(new Audio(otfgkMp));

  const OTFGK = ['79', '84', '70', '71', '75'];

  const handelOtfgk = () => {
    setIgnoreParams(true);
    setThemeBM('bm');

    handlePauseBoth();
    handleTheme();

    audioOtfgk.play();
    audioOtfgk.volume = 0.2;
    setMotionInitial({
      opacity: 0,
      scale: 0.2,
      translate: '-50% -50%',
    });
    setMotionInView('');
    setMotionAnimate({ opacity: 1, scale: 2 });
    setMotionTransition({ duration: 15.5 });

    setTimeout(() => {
      setShowCard(true);
      setTheme({
        visibility: 'invisible',
      });
    }, '1500');

    setTimeout(() => {
      setShowCard(false);
      setThemeBM('otfgk');
      handleTheme();
    }, '9000');
  };

  useKonami(handelOtfgk, { code: OTFGK });

  //THEONE
  const THEONE = ['84', '72', '69', '79', '78', '69'];

  const handelTheOne = () => {
    setIgnoreParams(true);
    setThemeBM('theone');
    handleTheme();
  };

  useKonami(handelTheOne, { code: THEONE });

  // DEATH CODE

  const [audio] = useState(new Audio(deathMp));
  const [death, setDeath] = useState(false);
  const DEATH = ['68', '69', '65', '84', '72'];

  const handleDeath = () => {
    setIgnoreParams(true);
    setThemeBM('bm');

    handlePauseBoth();
    handleTheme();

    setDeath(true);
    setShowCard(true);

    setMotionInitial('offscreen');
    setMotionInView('onscreen');
    setMotionAnimate('');
    setMotionTransition('');

    audio.play();
    audio.volume = 0.2;

    setTimeout(() => {
      setDeath(false);
      setThemeBM('death');
      setShowCard(false);
      handleTheme();
    }, '51000');
  };

  useKonami(handleDeath, { code: DEATH });

  const SKIP = ['32'];

  //skip audio and animation
  const handelSkip = () => {
    audio.pause();
    audioOtfgk.pause();
    setShowCard(false);
    setDeath(false);
    setTheme({
      visibility: '',
    });
    handleTheme();
  };

  useKonami(handelSkip, { code: SKIP });

  var cardVariantsDeath = {
    offscreen: {
      y: 900,
    },
    onscreen: {
      y: -100,
      rotate: 0,
      opacity: [
        0.2, 0.8, 0.9, 0.8, 0.2, 0.6, 0.2, 0.8, 0.9, 0.8, 0.2, 0.6, 0.2, 0.8,
        0.9, 0.8, 0.2, 0.6, 0.2, 0.8, 0.9, 0.8, 0.2, 0.6, 0.2, 0.8, 0.9, 0.8,
        0.2, 0.9, 0.2, 0.8, 0.9, 0.8, 0.2, 0.9, 0.2, 0.8, 0.9, 0.8, 0.2, 0.9,
        0.2, 0.8, 0.9, 0.8, 0.2, 0.9, 0.2, 0.8, 0.9, 0.8, 0.2, 0.9, 0.2, 0.8,
        0.9, 0.8, 0.2, 0.9, 0.2, 0.8, 0.9, 0.8, 0.2, 0.9,
      ],
      transition: {
        type: 'tween',

        duration: 35.0,
      },
    },
  };

  function Card() {
    return (
      <motion.div
        className={`card-container `}
        initial={motionInitial}
        whileInView={motionInView}
        viewport={{ once: true, amount: 0.8 }}
        animate={motionAnimate}
        transition={motionTransition}
      >
        <div />
        <motion.div className="card" variants={death ? cardVariantsDeath : ''}>
          <img className="" src={death ? cross : imageOtfgk} />
        </motion.div>
      </motion.div>
    );
  }

  //get url data and update theme
  useEffect(() => {
    handelParams();

    handleTheme();
  }, [themeBM]);

  return (
    <div className={` relative ${theme.backgroundColor} ${theme.textColor} `}>
      {showCard ? <Card /> : ''}
      <section
        className={`flex flex-col lg:flex-row content-center mt-8 ${theme.visibility}`}
      >
        <div className="w-full">
          <div className=" player-wrapper">
            {/* reactor video player */}
            <ReactPlayer
              className="react-player"
              ref={playerRef}
              width="100%"
              height="100%"
              url={reactorUrl}
              playing={playing}
              onProgress={handleProgress}
              controls={true}
              onReady={onReady}
              onPlay={handlePlay}
              onPause={handlePause}
              onStart={() => console.log('onStart')}
              onError={(e) => console.log('onError', e)}
            />
          </div>
        </div>
        <div className="w-full">
          <div className="player-wrapper">
            {/* content video player */}
            <ReactPlayer
              className="react-player"
              ref={contentRef}
              width="100%"
              height="100%"
              controls={true}
              url={talenturl}
              playing={talentPlaying}
              onPlay={handlePlay}
              onPause={handlePauseTalent}
              onError={(e) => console.log('onError', e)}
              onReady={onContentReady}
              onStart={() => console.log('onStart')}
              onPlaybackQualityChange={(e) =>
                console.log('onPlaybackQualityChange', e)
              }
            />
          </div>
        </div>
      </section>
      <section className={` ${theme.bgImage} ${theme.visibility} `}>
        {theme.logoImage !== undefined ? (
          <div className="flex justify-center mt-6 w-full">
            <img className="" src={`${theme.logoImage} `} />
          </div>
        ) : (
          ''
        )}

        <div className={`flex justify-center my-4 p-5   `}>
          <button
            onClick={handlePlay}
            className={`rounded-lg ${theme.buttonBG} px-3 py-2 text-lg font-semibold ${theme.buttonText} ${theme.buttonBorder} shadow-sm ${theme.buttonHover} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.buttonOutline} w-full`}
          >
            Start Reaction
          </button>
        </div>
        <div className=" columns-2 my-4">
          <div className="text-center  ">
            <button
              onClick={handlePlayBoth}
              className=" rounded-md bg-red-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-800"
            >
              Play Both Videos
            </button>
          </div>

          <div className=" text-center">
            <button
              onClick={handlePauseBoth}
              className="rounded-md bg-orange-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
            >
              Pause Both Videos
            </button>
          </div>
        </div>
        <div className=" relative">
          <form
            onSubmit={handleSubmit}
            className={`${theme.textColor}  grid md:grid-cols-2 grid-cols-1 p-5`}
          >
            <div className="mt-10 grid grid-cols-1 gap-x-3 gap-y-3   ">
              <div
                className={`sm:col-span-4 p-2 mr-20  ${theme.contentBackgroundColor} sm:max-w-md`}
              >
                <label
                  htmlFor="ReactorUrl"
                  className={`p-2 text-md font-medium leading-6  `}
                >
                  Reactor Url
                </label>
                <div className="mt-2">
                  <div
                    className={`flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset ${theme.inputFocus}  sm:max-w-md`}
                  >
                    <input
                      required
                      type="text"
                      name="Reactorurl"
                      id="ReactorUrl"
                      className={`block flex-1 border-0 bg-transparent py-1.5 pl-1 ${theme.textColor} placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6`}
                      placeholder="https://www.youtube.com/watch?v=LXb3EKWsInQ"
                      onChange={(e) => {
                        setReactorUrl(e.target.value);
                        setIgnoreParams(true);
                      }}
                      value={reactorUrl}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-x-3 gap-y-3 ">
              <div
                className={`sm:col-span-4 mr-20 p-2 ${theme.contentBackgroundColor} sm:max-w-md`}
              >
                <label
                  htmlFor="talentUrl"
                  className={` p-2 text-md font-medium leading-6 `}
                >
                  Content Url
                </label>
                <div className="mt-2">
                  <div
                    className={`flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset ${theme.inputFocus}   sm:max-w-md`}
                  >
                    <input
                      required
                      type="text"
                      name="talenturl"
                      id="talentUrl"
                      className={`block flex-1 border-0 bg-transparent py-1.5 pl-1 ${theme.textColor} placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6`}
                      placeholder="https://www.youtube.com/watch?v=LXb3EKWsInQ"
                      onChange={(e) => {
                        setTalentUrl(e.target.value);
                        settalentUrlInputValue(e.target.value);
                        setIgnoreParams(true);
                      }}
                      value={talentUrlInputValue}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* start time  reactor video */}
            <div className="mt-10 grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div
                className={`sm:col-span-4 mr-20 p-2 ${theme.contentBackgroundColor} sm:max-w-md`}
              >
                <label
                  htmlFor="reactorStart"
                  className={`p-2 text-md font-medium leading-6 0`}
                >
                  Start recator video from M:SS if you want to skip intro
                </label>
                <div className="mt-2">
                  <div
                    className={`flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset ${theme.inputFocus}   sm:max-w-md`}
                  >
                    <input
                      type="text"
                      name="reactorstart"
                      id="reactorStart"
                      className={`block flex-1 border-0 bg-transparent py-1.5 pl-1 ${theme.textColor} placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6`}
                      placeholder="0:00"
                      onChange={handleReactorStart}
                      value={reactorStart}
                    />
                  </div>
                  {errorReactorStart ? (
                    <p
                      className={`${theme.errorText} ${theme.contentBackgroundColor} inline-block p-2`}
                    >
                      Error format 0:00
                    </p>
                  ) : (
                    <p></p>
                  )}
                </div>
              </div>

              {/* reactor pause */}

              {pauseSection ? (
                <div>
                  {reactorPauseResume.map((form, index) => {
                    return (
                      <div key={index}>
                        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2">
                          <div
                            className={`p-2 mr-20 ${theme.contentBackgroundColor} sm:max-w-md`}
                          >
                            <label
                              htmlFor="pause"
                              className={` text-md font-medium leading-6 0`}
                            >
                              Recator Pause content at M:SS
                            </label>
                            <div className="mt-2">
                              <div
                                className={`flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset ${theme.inputFocus}  sm:max-w-md`}
                              >
                                <input
                                  type="text"
                                  name="pause"
                                  id="pause"
                                  className={`block flex-1 border-0 bg-transparent py-1.5 pl-1 ${theme.textColor} placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6`}
                                  placeholder="0:20"
                                  onChange={(event) =>
                                    handlePauseResume(event, index)
                                  }
                                  value={form.pause}
                                />
                              </div>
                            </div>
                            {/* {errorReactorPauseResume ? (
                              <p
                                className={`${theme.errorText} ${theme.contentBackgroundColor} inline-block p-2`}
                              >
                                Error format 0:00
                              </p>
                            ) : (
                              <p></p>
                            )} */}
                          </div>

                          <div
                            className={`p-2 mr-20 ${theme.contentBackgroundColor} sm:max-w-md`}
                          >
                            <label
                              htmlFor="resume"
                              className="block text-md font-medium leading-6 0"
                            >
                              Recator Resumes content at M:SS
                            </label>
                            <div className="mt-2">
                              <div
                                className={`flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset ${theme.inputFocus}  sm:max-w-md`}
                              >
                                <input
                                  type="text"
                                  name="resume"
                                  id="resume"
                                  className={`block flex-1 border-0 bg-transparent py-1.5 pl-1 ${theme.textColor} placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6`}
                                  placeholder="0:20"
                                  onChange={(event) =>
                                    handlePauseResume(event, index)
                                  }
                                  value={form.resume}
                                />
                                <button onClick={() => removeFields(index)}>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    class={`w-6 h-6 ${theme.svgFill}`}
                                  >
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            {/* {errorReactorPauseResume ? (
                        <p className="text-red-600">Error format 0:00</p>
                      ) : (
                        <p></p>
                      )} */}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="text-center mt-5">
                    <div>
                      {errorReactorPauseResume ? (
                        <p
                          className={`${theme.errorText} ${theme.contentBackgroundColor} inline-block p-2`}
                        >
                          Error Check Pause and Resume format 0:00
                        </p>
                      ) : (
                        <p></p>
                      )}
                    </div>
                    <button
                      onClick={addFields}
                      className={`rounded-md ${theme.buttonBG} px-3 py-2 text-sm font-semibold ${theme.buttonText} ${theme.buttonBorder}  shadow-sm ${theme.buttonHover} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.buttonOutline}`}
                    >
                      Add more
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center mt-5">
                  <button
                    onClick={handlePauseSection}
                    className={`rounded-md ${theme.buttonBG} px-3 py-2 text-sm font-semibold ${theme.buttonText} ${theme.buttonBorder}  shadow-sm ${theme.buttonHover} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.buttonOutline}`}
                  >
                    Add Pause
                  </button>
                </div>
              )}
            </div>
            {/* start talent video from */}
            <div className="mt-10  grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div
                className={`sm:col-span-4 mr-20 p-2 ${theme.contentBackgroundColor} sm:max-w-md`}
              >
                <label
                  htmlFor="talentStart"
                  className={`p-2 text-md font-medium leading-6 0`}
                >
                  Start content when reactor video time is at M:SS
                </label>
                <div className="mt-2">
                  <div
                    className={`flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset ${theme.inputFocus}  sm:max-w-md`}
                  >
                    <input
                      required
                      type="text"
                      name="talenstart"
                      id="talentStart"
                      className={`block flex-1 border-0 bg-transparent py-1.5 pl-1 ${theme.textColor} placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6`}
                      placeholder="0:10"
                      onChange={handleTalentStart}
                      value={talentStartInputValue}
                    />
                  </div>
                  {errorTalentStart ? (
                    <div
                      className={`${theme.errorText} ${theme.contentBackgroundColor} inline-block p-2`}
                    >
                      Error Check format 0:00
                    </div>
                  ) : (
                    <p></p>
                  )}
                </div>
              </div>

              {/* extra content pause */}

              {extraContentSection ? (
                <div>
                  {extraContent.map((form, index) => {
                    return (
                      <div key={index}>
                        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 ">
                          <div
                            className={`p-2 mr-20 ${theme.contentBackgroundColor} sm:max-w-md`}
                          >
                            <label
                              htmlFor="Content Start"
                              className={` text-md font-medium leading-6 0`}
                            >
                              Start Extra Content when Reactor video Time is at
                              M:SS
                            </label>
                            <div className="mt-2">
                              <div
                                className={`flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset ${theme.inputFocus}  sm:max-w-md`}
                              >
                                <input
                                  type="text"
                                  name="start"
                                  id="Content Start"
                                  className={`block flex-1 border-0 bg-transparent py-1.5 pl-1 ${theme.textColor} placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6`}
                                  placeholder="5:40"
                                  onChange={(event) =>
                                    handleExtraContent(event, index)
                                  }
                                  value={form.start}
                                />
                              </div>
                            </div>
                            {errorExtraContentStart ? (
                              <p
                                className={`${theme.errorText} ${theme.contentBackgroundColor} inline-block p-2`}
                              >
                                Error format 0:00
                              </p>
                            ) : (
                              <p></p>
                            )}
                          </div>

                          <div
                            className={`p-2 mr-20 ${theme.contentBackgroundColor} sm:max-w-md`}
                          >
                            <label
                              htmlFor="Extra Content URL"
                              className="block text-md font-medium leading-6 0"
                            >
                              Extra Content URL
                            </label>
                            <div className="mt-2">
                              <div
                                className={`flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset ${theme.inputFocus}  sm:max-w-md`}
                              >
                                <input
                                  type="text"
                                  name="url"
                                  id="Extra Content URL"
                                  className={`block flex-1 border-0 bg-transparent py-1.5 pl-1 ${theme.textColor} placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6`}
                                  placeholder="https://www.youtube.com/watch?v=LXb3EKWsInQ"
                                  onChange={(event) =>
                                    handleExtraContent(event, index)
                                  }
                                  value={form.url}
                                />
                                <button
                                  onClick={() =>
                                    removeExtraContentFields(index)
                                  }
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    class={`w-6 h-6 ${theme.svgFill}`}
                                  >
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            {/* {errorReactorPauseResume ? (
                        <p className="text-red-600">Error format 0:00</p>
                      ) : (
                        <p></p>
                      )} */}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="text-center mt-5">
                    {/* <div>
                      {errorReactorPauseResume ? (
                        <p
                          className={`${theme.errorText} ${theme.contentBackgroundColor} inline-block p-2`}
                        >
                          Error Check Pause and Resume format 0:00
                        </p>
                      ) : (
                        <p></p>
                      )}
                      addExtraContentFields
                    </div> */}
                    <button
                      onClick={addExtraContentFields}
                      className={`rounded-md ${theme.buttonBG} px-3 py-2 text-sm font-semibold ${theme.buttonText} ${theme.buttonBorder}  shadow-sm ${theme.buttonHover} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.buttonOutline}`}
                    >
                      Add More
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center mt-5">
                  <button
                    onClick={handleExtraContentSection}
                    className={`rounded-md ${theme.buttonBG} px-3 py-2 text-sm font-semibold ${theme.buttonText} ${theme.buttonBorder}  shadow-sm ${theme.buttonHover} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.buttonOutline}`}
                  >
                    Add Extra Content
                  </button>
                </div>
              )}
            </div>
            <div className=" grid-cols-1 col-span-full py-8">
              <button
                type="submit"
                className={`rounded-lg ${theme.buttonBG} px-3 py-2 text-lg font-semibold ${theme.buttonText} ${theme.buttonBorder}  shadow-sm ${theme.buttonHover} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.buttonOutline} w-full`}
              >
                Create a Shareable Link
              </button>
            </div>
          </form>

          <div className="flex justify-center my-4 "></div>
          <div className="flex justify-center my-4 max-w-full text-wrap overflow-hidden">
            <div className="flex justify-center text-lg">
              {errorTalentStart ||
              errorReactorStart ||
              sharelink === undefined ||
              errorReactorPauseResume ? (
                <p className="text-red">error invalid inputs</p>
              ) : (
                <div className="text-center w-1/2">
                  <button
                    className={`rounded-md ${theme.buttonBG} px-3 py-2 text-sm font-semibold ${theme.buttonText} ${theme.buttonBorder}  shadow-sm ${theme.buttonHover} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${theme.buttonOutline}`}
                    onClick={() => navigator.clipboard.writeText(sharelink)}
                  >
                    Copy Link
                  </button>
                  <div className="border-2 rounded-md border-white text-center text-wrap bg-slate-700 p-4  ">
                    <p className="text-wrap break-words">{sharelink}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
