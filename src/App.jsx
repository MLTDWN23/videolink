import { useParams } from 'react-router-dom';
import { useCallback, useRef, useState, useEffect } from 'react';

import ReactPlayer from 'react-player';
import { Duration, format } from './Duration';
import { useKonami } from 'react-konami-code';
import { motion } from 'framer-motion';
import './app.css';
import logo from './assets/logo.png';
import dokiLogo from './assets/dokilogo.png';
import cross from './assets/deathCross.png';
import imageOtfgk from './assets/otfgk.png';
import deathMp from './assets/deathshort.aac';
import otfgkMp from './assets/otfgk.aac';

function App() {
  const playerRef = useRef();
  const contentRef = useRef();
  let { colorWay, reactUrl, reactStart, talUrl, talStart, playPause } =
    useParams();

  const [reactorUrl, setReactorUrl] = useState(
    'https://www.youtube.com/watch?v=LXb3EKWsInQ'
  );
  const [talenturl, setTalentUrl] = useState(
    'https://www.youtube.com/watch?v=LXb3EKWsInQ'
  );

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

  const [pauseSection, setPauseSection] = useState(false);

  const [reactorPauseResume, setReactorPauseResume] = useState([
    { pause: '', resume: '' },
  ]);

  const [errorReactorPauseResume, setErrorReactorPauseResume] = useState();

  const [themeBM, setThemeBM] = useState();

  //Motion state
  const [showCard, setShowCard] = useState(false);
  const [motionInitial, setMotionInitial] = useState();
  const [motionInView, setMotionInView] = useState();
  const [motionAnimate, setMotionAnimate] = useState();
  const [motionTransition, setMotionTransition] = useState();

  //setThemeBM(false);

  const [theme, setTheme] = useState({
    backgroundColor: 'bg-slate-950',
    contentBackgroundColor: '',
    buttonBG: 'bg-green-800',
    buttonBorder: '',
    buttonHover: 'hover:bg-green-700',
    buttonOutline: 'focus-visible:outline-green-800',
    buttonText: 'text-white',
    inputFocus: 'focus-within:ring-indigo-600',
    textColor: 'text-white',
    errorText: 'text-red-600',
    svgFill: 'fill-red-500',
    bgImage: '',
    visibility: '',
  });

  const regNum = /^\d+:\d{2,2}$/;

  //pull data from url
  const handelParams = () => {
    let res;

    //check for undefined before parsing json
    if (playPause === undefined) {
      res = undefined;
    } else {
      res = JSON.parse(playPause);
    }

    console.log(colorWay);
    //check and set data
    if (
      ignoreParams != true &&
      colorWay != undefined &&
      reactUrl != undefined &&
      reactStart != undefined &&
      talUrl != undefined &&
      talStart != undefined &&
      res != undefined
    ) {
      setReactorUrl(decodeURIComponent(reactUrl));
      setThemeBM(decodeURIComponent(colorWay));
      setReactorStart(decodeURIComponent(reactStart));
      setTalentUrl(decodeURIComponent(talUrl));
      setTalentStart(decodeURIComponent(talStart));
      setReactorPauseResume(res);
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

  //create link
  const handleShare = () => {
    setSharelink(
      `https://mltdwn23.github.io/videolink/#/${encodeURIComponent(
        themeBM
      )}/${encodeURIComponent(reactorUrl)}/${encodeURIComponent(
        reactorStart
      )}/${encodeURIComponent(talenturl)}/${encodeURIComponent(
        talentStart
      )}/${encodeURIComponent(JSON.stringify(reactorPauseResume))} `
    );
  };

  //handle input start time for content
  const handleReactorStart = (e) => {
    if (!regNum.test(e.target.value)) {
      setErrorReactorStart(true);
    } else {
      setReactorStart(e.target.value);
      setIgnoreParams(true);
      setErrorReactorStart(false);
    }
  };

  //handle input start time for content
  const handleTalentStart = (e) => {
    if (!regNum.test(e.target.value)) {
      setErrorTalentStart(true);
    } else {
      setTalentStart(e.target.value);
      setIgnoreParams(true);
      setErrorTalentStart(false);
    }
  };

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

  //handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    handleShare();
  };

  //start react video @
  const onReady = useCallback(() => {
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
    if (!isContentReady) {
      const parts = contentStart.split(':');
      const minutes = parseInt(parts[0], 10) || 0;
      const seconds = parseFloat(parts[1]) || 0;
      const timeToStart = minutes * 60 + seconds;

      contentRef.current.seekTo(timeToStart, 'seconds');
      setIsContentReady(true);
    }
  });

  //theme

  const handleTheme = () => {
    switch (themeBM) {
      case 'bm':
        setTheme({
          logoImage: logo,
          backgroundColor: 'bg-black',
          contentBackgroundColor: 'bg-black/[.7] ',
          buttonBG: 'bg-black',
          buttonBorder: 'border-2 border-bmRed',
          buttonHover: 'hover:bg-red-700',
          buttonOutline: 'focus-visible:outline-red-800',
          buttonText: 'text-bmRed hover:text-black',
          inputFocus: 'focus-within:ring-red-600',
          textColor: 'text-red-600',
          errorText: 'text-blue-600',
          svgFill: '',
          bgImage: 'bg-smoke bg-cover bg-center  bg-no-repeat  ',
          visibility: '',
        });
        break;
      case 'otfgk':
        setTheme({
          logoImage: logo,
          backgroundColor: 'bg-black',
          contentBackgroundColor: 'bg-black ',
          buttonBG: 'bg-black',
          buttonBorder: 'border-2 border-bmRed',
          buttonHover: 'hover:bg-red-700',
          buttonOutline: 'focus-visible:outline-red-800',
          buttonText: 'text-bmRed hover:text-black',
          inputFocus: 'focus-within:ring-red-600',
          textColor: 'text-red-600',
          errorText: 'text-blue-600',
          svgFill: '',
          bgImage: 'bg-otfgkBG bg-cover bg-center  bg-no-repeat  ',
          visibility: '',
        });
        break;
      case 'theone':
        setTheme({
          logoImage: logo,
          backgroundColor: 'bg-black',
          contentBackgroundColor: 'bg-black/[.7] ',
          buttonBG: 'bg-black',
          buttonBorder: 'border-2 border-amber-200',
          buttonHover: 'hover:bg-amber-200',
          buttonOutline: 'focus-visible:outline-amber-700',
          buttonText: 'text-amber hover:text-black',
          inputFocus: 'focus-within:ring-amber-500',
          textColor: 'text-amber-500',
          errorText: 'text-blue-600',
          svgFill: '',
          bgImage: 'bg-theOne bg-cover bg-center  bg-no-repeat  ',
          visibility: '',
        });
        break;
      case 'doki':
        setTheme({
          logoImage: dokiLogo,
          backgroundColor: 'bg-black',
          contentBackgroundColor: 'bg-black/[.7] ',
          buttonBG: 'bg-black',
          buttonBorder: 'border-2 border-pink-200',
          buttonHover: 'hover:bg-pink-200',
          buttonOutline: 'focus-visible:outline-pink-700',
          buttonText: 'text-pink hover:text-black',
          inputFocus: 'focus-within:ring-pink-500',
          textColor: 'text-pink-500',
          errorText: 'text-blue-600',
          svgFill: '',
          bgImage: 'bg-dokiBG bg-cover bg-center  bg-no-repeat  ',
          visibility: '',
        });
        break;
      default:
        setTheme({
          backgroundColor: 'bg-slate-950',
          contentBackgroundColor: '',
          buttonBG: 'bg-green-800',
          buttonBorder: '',
          buttonHover: 'hover:bg-green-700',
          buttonOutline: 'focus-visible:outline-green-800',
          buttonText: 'text-white',
          inputFocus: 'focus-within:ring-indigo-600',
          textColor: 'text-white',
          errorText: 'text-red-600',
          svgFill: 'fill-red-500',
          bgImage: '',
          visibility: '',
        });
    }
  };

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

  //BBAB CODE

  const handleBBAB = () => {
    setReactorUrl('https://www.youtube.com/watch?v=a3xokC9D6yc');
    setTalentUrl('https://www.youtube.com/watch?v=a3xokC9D6yc');
  };

  const BBAB = ['38', '40', '37', '39', '66', '66', '65', '66'];
  const easterEgg = () => {
    setIgnoreParams(true);
    handleBBAB();
    setThemeBM('bm');
    playerRef.current.player.player.mute();

    setTimeout(() => {
      handlePlayBoth();
    }, '1500');
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

    setIsReady(false);

    setTimeout(() => {
      handlePlayBoth();
    }, '1500');
  };

  useKonami(HandleDoki, { code: DOKI });

  //KITSUNE MEGITSUNE CODE

  const KITSUNE = ['75', '73', '84', '83', '85', '78', '69'];
  const MEGITSUNE = ['77', '69', '71', '73', '84', '83', '85', '78', '69'];

  const handelMegitsune = () => {
    setIgnoreParams(true);
    setReactorUrl('https://www.youtube.com/watch?v=RorkQ79V-68');
    setTalentUrl('https://www.youtube.com/watch?v=RorkQ79V-68');
    setThemeBM('bm');
    playerRef.current.player.player.mute();

    setTimeout(() => {
      handlePlayBoth();
    }, '1500');
  };

  useKonami(handelMegitsune, { code: KITSUNE });
  useKonami(handelMegitsune, { code: MEGITSUNE });

  //OTFGK code

  const [otfgk, setOtfgk] = useState(false);
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
      setShowCard(false);
    }, '51000');
  };

  useKonami(handleDeath, { code: DEATH });

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

  //get url data onload
  useEffect(() => {
    handelParams();

    handleTheme();
  }, [themeBM]);

  return (
    <div className={` relative ${theme.backgroundColor} ${theme.textColor} `}>
      {showCard ? <Card /> : ''}
      <section
        className={`flex flex-col md:flex-row content-center mt-8 ${theme.visibility}`}
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
                      name="ReactorUrl"
                      id="ReactorUrl"
                      className={`block flex-1 border-0 bg-transparent py-1.5 pl-1 ${theme.textColor} placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6`}
                      placeholder="https://www.youtube.com/watch?v=LXb3EKWsInQ"
                      onChange={(e) => {
                        setReactorUrl(e.target.value);
                        setIgnoreParams(true);
                      }}
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
                      name="talentUrl"
                      id="talentUrl"
                      className={`block flex-1 border-0 bg-transparent py-1.5 pl-1 ${theme.textColor} placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6`}
                      placeholder="https://www.youtube.com/watch?v=LXb3EKWsInQ"
                      onChange={(e) => {
                        setTalentUrl(e.target.value);
                        setIgnoreParams(true);
                      }}
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
                  Start recator video from M:SS if you want to skip intro (can
                  be left empty)
                </label>
                <div className="mt-2">
                  <div
                    className={`flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset ${theme.inputFocus}   sm:max-w-md`}
                  >
                    <input
                      type="text"
                      name="reactorStart"
                      id="reactorStart"
                      className={`block flex-1 border-0 bg-transparent py-1.5 pl-1 ${theme.textColor} placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6`}
                      placeholder="0:00"
                      onChange={handleReactorStart}
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
                        <div className="mt-10 grid grid-cols-2">
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
                      name="talenStart"
                      id="talentStart"
                      className={`block flex-1 border-0 bg-transparent py-1.5 pl-1 ${theme.textColor} placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6`}
                      placeholder="0:10"
                      onChange={handleTalentStart}
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
          <div className="flex justify-center my-4 max-w-full text-wrap">
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
