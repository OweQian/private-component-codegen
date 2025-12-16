import { useEmotionCss } from '@ant-design/use-emotion-css';

export const useClassName = () => {
  const className = useEmotionCss(() => {
    return {
      color: 'rgba(255, 255, 255, 0.8)',
      '.waitingAnimation > :last-child::after': {
        display: 'inline-block',
        content: '""',
        width: '2px',
        height: '14px',
        transform: 'translate(4px, 2px) scaleY(1.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        animation: 'blink 0.6s infinite'
      },
      '.waitingAnimation > pre:last-child::after': {
        backgroundColor: '#fff'
      },
      '.animation': {
        height: '20px',

        '&::after': {
          display: 'inline-block',
          content: '""',
          width: '3px',
          height: '14px',
          transform: 'translate(4px, 2px) scaleY(1.3)',
          backgroundColor: 'var(--chakra-colors-primary-700)',
          animation: 'blink 0.6s infinite'
        }
      },
      '@keyframes blink': {
        'from,to': {
          opacity: 0
        },
        '50%': {
          opacity: 1
        }
      },
      '.markdown > *:first-child': {
        marginTop: '0 !important'
      },
      '.markdown > *:last-child': {
        marginBottom: '0 !important'
      },
      '.markdown a.absent': {
        color: '#cc0000'
      },
      '.markdown a.anchor': {
        bottom: 0,
        cursor: 'pointer',
        display: 'block',
        left: 0,
        marginlLeft: '-30px',
        paddingLeft: '30px',
        position: 'absolute',
        top: 0
      },
      '.markdown h1,.markdown h2,.markdown h3,.markdown h4,.markdown h5,.markdown h6': {
        cursor: 'text',
        fontWeight: 'bold',
        margin: '10px 0',
        padding: 0,
        position: 'relative'
      },
      '.markdown h1 .mini-icon-link,.markdown h2 .mini-icon-link,.markdown h3 .mini-icon-link,.markdown h4 .mini-icon-link,.markdown h5 .mini-icon-link,.markdown h6 .mini-icon-link':
        {
          display: 'none'
        },
      '.markdown h1:hover a.anchor,.markdown h2:hover a.anchor,.markdown h3:hover a.anchor,.markdown h4:hover a.anchor,.markdown h5:hover a.anchor,.markdown h6:hover a.anchor':
        {
          lineHeight: 1,
          marginlLeft: '-22px',
          paddingLeft: 0,
          textDecoration: 'none',
          top: '15%'
        },
      '.markdown h1:hover a.anchor .mini-icon-link,.markdown h2:hover a.anchor .mini-icon-link,.markdown h3:hover a.anchor .mini-icon-link,.markdown h4:hover a.anchor .mini-icon-link,.markdown h5:hover a.anchor .mini-icon-link,.markdown h6:hover a.anchor .mini-icon-link':
        {
          display: 'inline-block'
        },
      '.markdown h1 tt,.markdown h1 code,.markdown h2 tt,.markdown h2 code,.markdown h3 tt,.markdown h3 code,.markdown h4 tt,.markdown h4 code,.markdown h5 tt,.markdown h5 code,.markdown h6 tt,.markdown h6 code':
        {
          fontSize: 'inherit'
        },
      '.markdown h1': {
        fontSize: '28px'
      },
      '.markdown h2': {
        fontSize: '24px'
      },
      '.markdown h3': {
        fontSize: '18px'
      },
      '.markdown h4': {
        fontSize: '16px'
      },
      '.markdown h5': {
        fontSize: '14px'
      },
      '.markdown h6': {
        fontSize: '12px'
      },
      '.markdown p,.markdown blockquote,.markdown ul,.markdown ol,.markdown dl,.markdown table,.markdown pre':
        {
          margin: '14px 0'
        },
      '.markdown > h2:first-child,.markdown > h1:first-child,.markdown > h1:first-child + h2,.markdown > h3:first-child,.markdown > h4:first-child,.markdown > h5:first-child,.markdown > h6:first-child':
        {
          marginTop: 0,
          paddingTop: 0
        },
      '.markdown a:first-child h1,.markdown a:first-child h2,.markdown a:first-child h3,.markdown a:first-child h4,.markdown a:first-child h5,.markdown a:first-child h6':
        {
          marginTop: 0,
          paddingTop: 0
        },
      '.markdown h1 + p,.markdown h2 + p,.markdown h3 + p,.markdown h4 + p,.markdown h5 + p,.markdown h6 + p':
        {
          marginTop: 0
        },
      '.markdown li p.first': {
        display: 'inline-block'
      },
      '.markdown ul,.markdown ol': {
        paddingLeft: '2em',
        color: 'rgba(255, 255, 255, 0.8)'
      },
      '.markdown ul.no-list,.markdown ol.no-list': {
        listStyleType: 'none',
        padding: 0
      },
      '.markdown ul li > *:first-child,.markdown ol li > *:first-child': {
        marginTop: 0
      },
      '.markdown ol': {
        paddingLeft: '17px'
      },
      '.markdown dl': {
        padding: '0 0 0 14px'
      },
      '.markdown dl dt': {
        fontSize: '14px',
        fontStyle: 'italic',
        fontWeight: 'bold',
        margin: '15px 0 5px',
        padding: 0
      },
      '.markdown dl dt:first-child': {
        padding: 0
      },
      '.markdown dl dt > *:first-child': {
        marginTop: 0
      },
      '.markdown dl dt > *:last-child': {
        marginBottom: 0
      },
      '.markdown dl dd': {
        margin: '0 0 15px',
        padding: '0 15px'
      },
      '.markdown dl dd > *:first-child': {
        marginTop: 0
      },
      '.markdown dl dd > *:last-child': {
        marginBottom: 0
      },
      '.markdown blockquote': {
        borderLeft: '4px solid #dddddd',
        color: '#777777',
        padding: '0 15px'
      },
      '.markdown blockquote > *:first-child': {
        marginTop: 0
      },
      '.markdown blockquote > *:last-child': {
        marginBottom: 0
      },
      '.markdown table': {
        width: '100%'
      },
      '.markdown table th': {
        fontWeight: 'bold'
      },
      '.markdown table th,.markdown table td': {
        padding: '6px 13px'
      },
      '.markdown table tr': {
        backgroundColor: '#ffffff'
      },
      '.markdown table tr:nth-child(2n)': {
        backgroundColor: '#f0f0f0'
      },
      '.markdown img': {
        maxWidth: '100%'
      },
      '.markdown span.frame': {
        display: 'block',
        overflow: 'hidden'
      },
      '.markdown span.frame > span': {
        border: '1px solid #dddddd',
        display: 'block',
        float: 'left',
        margin: '13px 0 0',
        overflow: 'hidden',
        padding: '7px',
        width: 'auto'
      },
      '.markdown span.frame span img': {
        display: 'block',
        float: 'left'
      },
      '.markdown span.frame span span': {
        clear: 'both',
        color: '#333333',
        display: 'block',
        padding: '5px 0 0'
      },
      '.markdown span.align-center': {
        clear: 'both',
        display: 'block',
        overflow: 'hidden'
      },
      '.markdown span.align-center > span': {
        display: 'block',
        margin: '13px auto 0',
        overflow: 'hidden',
        textAlign: 'center'
      },
      '.markdown span.align-center span img': {
        margin: '0 auto',
        textAlign: 'center'
      },
      '.markdown span.align-right': {
        clear: 'both',
        display: 'block',
        overflow: 'hidden'
      },
      '.markdown span.align-right > span': {
        display: 'block',
        margin: '13px 0 0',
        overflow: 'hidden',
        textAlign: 'right'
      },
      '.markdown span.align-right span img': {
        margin: 0,
        textAlign: 'right'
      },
      '.markdown span.float-left': {
        display: 'block',
        float: 'left',
        marginRight: '13px',
        overflow: 'hidden'
      },
      '.markdown span.float-left span': {
        margin: '13px 0 0'
      },
      '.markdown span.float-right': {
        display: 'block',
        float: 'right',
        marginlLeft: '13px',
        overflow: 'hidden'
      },
      '.markdown span.float-right > span': {
        display: 'block',
        margin: '13px auto 0',
        overflow: 'hidden',
        textAlign: 'right'
      },
      '.markdown code,.markdown tt': {
        border: '1px solid #333',
        backgroundColor: '#1e1e1e',
        borderRadius: '3px',
        margin: '0 2px',
        padding: '0 5px'
      },
      '.markdown pre > code': {
        background: 'none repeat scroll 0 0 transparent',
        border: 'medium none',
        margin: 0,
        padding: 0
      },
      '.markdown .highlight pre,.markdown pre': {
        border: '1px solid #cccccc',
        borderRadius: '3px 3px 3px 3px',
        fontSize: 'max(0.9em, 12px)',
        lineHeight: '19px',
        overflow: 'auto',
        padding: '6px 10px'
      },
      '.markdown pre code,.markdown pre tt': {
        backgroundColor: 'transparent',
        border: 'medium none'
      },
      '.markdown hr': {
        margin: '10px 0'
      },
      '.markdown': {
        tabSize: '4',
        wordSpacing: 'normal',
        width: '100%',
        color: 'rgba(255, 255, 255, 0.8)',

        '*': {
          wordBreak: 'break-word'
        },

        pre: {
          display: 'block',
          width: '100%',
          padding: '15px',
          margin: 0,
          border: 'none',
          borderRadius: '6px',
          backgroundColor: '#1e1e1e !important',
          overflowX: 'auto',
          color: '#fff'
        },

        'pre code': {
          backgroundColor: '#1e1e1e !important',
          width: '100%'
        },

        a: {
          textDecoration: 'underline',
          color: 'var(--chakra-colors-blue-400)'
        },

        table: {
          borderCollapse: 'separate',
          borderSpacing: 0,
          color: 'rgba(255, 255, 255, 0.8)',

          'thead tr:first-child th': {
            borderBottomWidth: '1px',
            borderLeftWidth: '1px',
            borderTopWidth: '1px',
            borderColor: '#333',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',

            '&:first-child': {
              borderTopLeftRadius: '0.375rem'
            },
            '&:last-child': {
              borderRightWidth: '1px',
              borderTopRightRadius: '0.375rem'
            }
          },

          td: {
            borderBottomWidth: '1px',
            borderLeftWidth: '1px',
            borderColor: '#333',

            '&:last-of-type': {
              borderRightWidth: '1px'
            }
          },

          'tbody tr:last-child': {
            overflow: 'hidden',
            td: {
              '&:first-child': {
                borderBottomLeftRadius: '0.375rem'
              },
              '&:last-child': {
                borderBottomRightRadius: '0.375rem'
              }
            }
          }
        },

        blockquote: {
          borderLeft: '4px solid #444',
          color: '#999',
          padding: '0 15px'
        },

        'table tr': {
          backgroundColor: '#1a1a1a'
        },
        'table tr:nth-child(2n)': {
          backgroundColor: '#242424'
        },

        ul: {
          listStyle: 'disc outside',
          paddingLeft: '2em',
          '& li': {
            display: 'list-item',
            color: 'rgba(255, 255, 255, 0.8)',
            '& > *': {
              color: 'rgba(255, 255, 255, 0.8)'
            }
          }
        },

        ol: {
          listStyle: 'decimal outside',
          paddingLeft: '2em',
          '& li': {
            display: 'list-item',
            color: 'rgba(255, 255, 255, 0.8)',
            '& > *': {
              color: 'rgba(255, 255, 255, 0.8)'
            }
          }
        }
      }
    };
  });
  return className;
};

export const useCodeLightClassName = () => {
  const className = useEmotionCss(() => {
    return {
      '.code-light-header': {
        fontSize: '12px',
        color: '#fff',
        backgroundColor: '#323641',
        userSelect: 'none',
        padding: '4px 10px'
      },
      '.code-light-copy': {
        fontSize: '12px',

        cursor: 'pointer'
      }
    };
  });
  return className;
};
