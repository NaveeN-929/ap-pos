import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Slider from 'react-slick';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// Import banner images
import soupBanner1 from '../images/banner1.webp';
import soupBanner2 from '../images/banner2.webp';
import soupBanner3 from '../images/banner3.webp';
import logo from '../images/logo.webp';
import langIcon from '../images/icon/LangIcon1.webp';

// Import menu images
import soupBanner0 from '../images/menu/hibiscus.webp';
import soupBanner2Menu from '../images/menu/Thuthuvalai.webp';
import soupBanner5 from '../images/menu/vazhaithandu.webp';
import soupBanner6 from '../images/menu/manathkkali.webp';
import soupBanner7 from '../images/menu/pirandai.webp';
import soupBanner9 from '../images/menu/moringa.webp';
import soupBanner10 from '../images/menu/mushroom.webp';
import soupBanner12 from '../images/menu/amla.webp';
import soupBanner14 from '../images/menu/aavarampoo.webp';
import soupBanner15 from '../images/menu/kollu.webp';

// Import CSS for slick carousel
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const DigitalMenu = () => {
  const { t, i18n } = useTranslation();
  const [ismenuopen, setismenuopen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isLangHovered, setIsLangHovered] = useState(false);
  const menuContainerRef = useRef(null);
  const scrollIntervalRef = useRef(null);

  // Menu items with images
  const menuItems = [
    { key: 0, image: soupBanner0 },
    { key: 2, image: soupBanner2Menu },
    { key: 5, image: soupBanner5 },
    { key: 6, image: soupBanner6 },
    { key: 7, image: soupBanner7 },
    { key: 9, image: soupBanner9 },
    { key: 10, image: soupBanner10 },
    { key: 12, image: soupBanner12 },
    { key: 14, image: soupBanner14 },
    { key: 15, image: soupBanner15 },
  ];

  const languages = [
    { code: 'en', name: 'Eng' },
    { code: 'kn', name: 'Kan' },
    { code: 'ta', name: 'Tam' },
  ];

  const selectLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsLangHovered(false);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
  };

  const handleMenuToggle = () => {
    setismenuopen(!ismenuopen);
  };

  // Auto-scroll logic
  useEffect(() => {
    if (ismenuopen) {
      const scrollContainer = menuContainerRef.current;

      const scrollMenu = () => {
        if (scrollContainer && !hovered) {
          if (scrollContainer.scrollHeight === scrollContainer.scrollTop + scrollContainer.clientHeight) {
            scrollContainer.scrollTop = 0;
          } else {
            scrollContainer.scrollTop += 1;
          }
        }
      };

      scrollIntervalRef.current = setInterval(scrollMenu, 30);

      return () => clearInterval(scrollIntervalRef.current);
    }
  }, [ismenuopen, hovered]);

  const MenuContent = () => {
    const translatedItems = t('menu.items', { returnObjects: true });

    return (
      <MenuContainer>
        <h2>{t('menu.title')}</h2>
        <LanguageIndicator>{t('menu.language', { lng: i18n.language })}</LanguageIndicator>
        <MenuGrid>
          {translatedItems.map((item, index) => (
            <MenuItem key={item.key || index}>
              <img src={menuItems[index]?.image} alt={item.name} />
              <h3>{item.name}</h3>
              <p>{item.price}</p>
              <Description>{item.description}</Description>
            </MenuItem>
          ))}
        </MenuGrid>
      </MenuContainer>
    );
  };

  return (
    <div>
      {/* Navbar Section */}
      <NavBarContainer ismenuopen={ismenuopen}>
        <LogoWrapper>
          <Link to="/">
            <LogoContainer>
              <img src={logo} alt="AP Logo" />
              <BusinessName>Aushadha Poorna</BusinessName>
            </LogoContainer>
          </Link>
        </LogoWrapper>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {ismenuopen && (
            <LanguageContainerWrapper
              onMouseEnter={() => setIsLangHovered(true)}
              onMouseLeave={() => setIsLangHovered(false)}
            >
              <LanguageIcon src={langIcon} alt="Select Language" />
              {isLangHovered && (
                <LanguageContainer>
                  {languages.map((lang, index) => (
                    <LanguageItem
                      key={lang.code}
                      onClick={() => selectLanguage(lang.code)}
                    >
                      {lang.name}
                      {index < languages.length - 1 && ', '}
                    </LanguageItem>
                  ))}
                </LanguageContainer>
              )}
            </LanguageContainerWrapper>
          )}
        </div>
      </NavBarContainer>

      {/* Banner Section with Slider */}
      <Banner>
        <Slider {...sliderSettings}>
          <Slide>
            <ImageBackground src={soupBanner1} />
            <HeroContent>
              <h1>Fresh Soups on the Go</h1>
              <p>Welcome to Aushadhapoorna. Every bowl is a warm hug.</p>
              <CTA>
                <button onClick={handleMenuToggle}>Explore Menu</button>
              </CTA>
            </HeroContent>
          </Slide>
          <Slide>
            <ImageBackground src={soupBanner3} />
            <HeroContent>
              <h1>Wellness in Every Spoon</h1>
              <p>Perfectly crafted soups for every craving, nurturing your body</p>
              <CTA>
                <button onClick={handleMenuToggle}>Browse Flavors</button>
              </CTA>
            </HeroContent>
          </Slide>
          <Slide>
            <ImageBackground src={soupBanner2} />
            <HeroContent>
              <h1>Healing in Every Bowl</h1>
              <p>Taste the bowl of our freshly made soups, designed to heal and energize</p>
              <CTA>
                <button onClick={handleMenuToggle}>Order Now</button>
              </CTA>
            </HeroContent>
          </Slide>
        </Slider>
      </Banner>

      {/* Overlay Menu Section */}
      {ismenuopen && (
        <MenuOverlay>
          <button className="close-button" onClick={handleMenuToggle}>
            &times;
          </button>
          <ScrollableMenuContainer
            ref={menuContainerRef}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <MenuContent />
          </ScrollableMenuContainer>
        </MenuOverlay>
      )}
    </div>
  );
};

export default DigitalMenu;

// Styled Components for Navbar
const NavBarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: ${(props) =>
    props.ismenuopen
      ? 'rgba(225, 225, 225, 0.4)'
      : 'rgba(225, 225, 225, 0.1)'};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  transition: background-color 0.3s ease;

  @media (max-width: 768px) {
    flex-direction: row;
    padding: 10px;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  img {
    width: 65px;
    height: auto;
  }

  a {
    display: flex;
    align-items: center;
    text-decoration: none;
  }
`;

const BusinessName = styled.h1`
  font-size: 1.5rem;
  color: #152b14;
  font-weight: 15;
  margin: 0;
  font-family: 'Alfa Slab One';

  @media (max-width: 20px) {
    font-size: 1rem;
  }
`;

const LanguageContainerWrapper = styled.div`
  position: relative;
  display: inline-block;
  z-index: 1001;

  &:hover > div {
    opacity: 1;
    transform: translateX(0);
    visibility: visible;
  }
`;

const LanguageIcon = styled.img`
  width: 30px;
  height: 30px;
  padding: 5px;
  transition: transform 0.2s ease;
  cursor: pointer;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);

  &:hover {
    transform: scale(1.2);
    background: rgba(255, 255, 255, 0.2);
  }
`;

const LanguageContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  color: #152b14;
  padding: 10px;
  min-width: 120px;
  z-index: 1002;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(21, 43, 20, 0.1);

  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease-in-out;
`;

const LanguageItem = styled.span`
  display: inline-block;
  cursor: pointer;
  font-size: 0.9rem;
  margin-right: 8px;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #152b14;
    color: white;
  }

  &:last-child {
    margin-right: 0;
  }
`;

// Styled Components for Banner
const Banner = styled.div`
  .slick-dots {
    bottom: 20px;
  }

  .slick-dots li button:before {
    color: white;
  }
`;

const Slide = styled.div`
  position: relative;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  text-align: center;
  color: white;
`;

const ImageBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.01), rgba(0, 0, 0, 1)), url(${(props) => props.src}) no-repeat center center/cover;
  z-index: -1;
`;

const HeroContent = styled.div`
  position: absolute;
  bottom: 180px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 800px;
  padding: 20px;
  margin-bottom: 120px;
  text-align: center;
  width: 90%;

  h1 {
    font-size: 3rem;
    margin-bottom: 20px;
  }

  p {
    font-size: 1.1rem;
    margin-bottom: 30px;
    line-height: 1.5;
  }
`;

const CTA = styled.div`
  button {
    background: #152b14;
    color: white;
    padding: 10px 20px;
    border-radius: 30px;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.3s ease;

    &:hover {
      background: #e64a19;
    }
  }
`;

const MenuOverlay = styled.div`
  position: fixed;
  top: 80px;
  left: 0;
  width: 100vw;
  height: calc(100vh - 80px);
  background: rgba(225, 225, 225, 0.98);
  color: #152b14;
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(2px);

  .close-button {
    position: absolute;
    top: 15px;
    right: 20px;
    font-size: 1.5rem;
    background: rgba(255, 255, 255, 0.9);
    color: #152b14;
    border: none;
    cursor: pointer;
    z-index: 1001;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 1);
      transform: scale(1.1);
    }
  }
`;

const ScrollableMenuContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 20px 40px 20px;
  box-sizing: border-box;

  scrollbar-width: thin;
  scrollbar-color: #152b14 #e1e1e1;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #152b14;
    border-radius: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #e1e1e1;
  }
`;

// Styled Components for Menu
const MenuContainer = styled.div`
  text-align: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 10px;

  h2 {  
    font-size: 2.8rem;
    margin-bottom: 15px;
    color: #152b14;
    font-weight: 700;
  }

  @media (max-width: 768px) {
    h2 {
      font-size: 2.2rem;
    }
  }
`;

const LanguageIndicator = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 40px;
  font-style: italic;
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  padding: 20px 0;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const MenuItem = styled.div`
  background: #fff;
  padding: 25px;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #152b14, #4CAF50);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  img {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border-radius: 15px;
    margin-bottom: 20px;
    transition: transform 0.3s ease;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 8px;
    color: #152b14;
    font-weight: 600;
    line-height: 1.3;
  }

  p {
    font-size: 1.3rem;
    color: #e64a19;
    margin-bottom: 15px;
    font-weight: 700;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    border-color: #152b14;

    &::before {
      transform: scaleX(1);
    }

    img {
      transform: scale(1.05);
    }
  }

  @media (max-width: 768px) {
    padding: 20px;
    
    img {
      height: 200px;
    }
    
    h3 {
      font-size: 1.3rem;
    }
    
    p {
      font-size: 1.1rem;
    }
  }
`;

const Description = styled.p`
  font-size: 1rem !important;
  color: #666 !important;
  margin-top: 15px !important;
  line-height: 1.6 !important;
  font-weight: 400 !important;
  text-align: left;
  padding: 0 5px;

  @media (max-width: 768px) {
    font-size: 0.9rem !important;
    line-height: 1.5 !important;
  }
`;