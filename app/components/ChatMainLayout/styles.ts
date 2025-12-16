import { useEmotionCss } from '@ant-design/use-emotion-css';

export const useStyles = () => {
  const dropdownClassName = useEmotionCss(() => ({
    '.ant-dropdown-menu': {
      backgroundColor: '#242424 !important'
    },
    '.ant-dropdown-menu-item': {
      color: '#e6e6e6 !important',
      '&:hover': {
        backgroundColor: '#333 !important'
      }
    }
  }));

  return {
    dropdownClassName
  };
};
