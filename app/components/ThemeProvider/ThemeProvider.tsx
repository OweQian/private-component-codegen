'use client';

import React, { useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
import type { ThemeProviderProps } from './interface';

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, isDarkMode = true }) => {
  // 只在客户端渲染时使用 useState
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm
      }}
    >
      {typeof window !== 'undefined' ? (
        children
      ) : (
        <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
          {children}
        </StyleSheetManager>
      )}
    </ConfigProvider>
  );
};

export default ThemeProvider;
