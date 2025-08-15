import 'dotenv/config';
import { FIGMA_API } from './figmaClient';

async function listFiles() {
  const token = process.env.FIGMA_TOKEN;
  if (!token) {
    console.error('FIGMA_TOKEN not set');
    process.exit(1);
  }

  try {
    const response = await fetch(`${FIGMA_API}/me/files`, {
      headers: {
        'X-Figma-Token': token,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch files: ${response.status}`);
    }

    const data = await response.json();
    console.log('Available files:');
    console.log('================');
    
    data.files?.forEach((file: any) => {
      console.log(`Name: ${file.name}`);
      console.log(`Key: ${file.key}`);
      console.log(`Last modified: ${file.last_modified}`);
      console.log('---');
    });

    if (!data.files || data.files.length === 0) {
      console.log('No files found or no access to files');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listFiles();
