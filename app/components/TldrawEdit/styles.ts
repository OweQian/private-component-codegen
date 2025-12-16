import { useEmotionCss } from '@ant-design/use-emotion-css';

export const useClassName = () => {
  const className = useEmotionCss(() => {
    return {
      '.tlui-debug-panel': {
        display: 'none'
      }
    };
  });
  return className;
};
