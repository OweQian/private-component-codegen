import { message } from 'antd';

/**
 * copy text data
 */
export const useCopyData = () => {
  return {
    copyData: async (data: string, title: string | null = '复制成功', duration = 2) => {
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(data);
        } else {
          throw new Error('');
        }
      } catch (error) {
        console.log(error);

        const textarea = document.createElement('textarea');
        textarea.value = data;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body?.removeChild(textarea);
      }

      message.success(title, duration);
    }
  };
};
