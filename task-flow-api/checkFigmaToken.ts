import 'dotenv/config';
import { FIGMA_API } from './figmaClient';

async function checkToken() {
  const token = process.env.FIGMA_TOKEN;
  if (!token) {
    console.error('FIGMA_TOKEN not set');
    process.exit(1);
  }

  console.log('Checking Figma token...');
  console.log('Token:', token.substring(0, 10) + '...');

  try {
    // Проверяем информацию о пользователе
    const userResponse = await fetch(`${FIGMA_API}/me`, {
      headers: {
        'X-Figma-Token': token,
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to get user info: ${userResponse.status} ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();
    console.log('\n✅ Token is valid!');
    console.log('User info:');
    console.log(`- ID: ${userData.id}`);
    console.log(`- Email: ${userData.email}`);
    console.log(`- Name: ${userData.name}`);
    console.log(`- Profile image: ${userData.img_url}`);

    // Пробуем получить файлы
    console.log('\nTrying to get files...');
    const filesResponse = await fetch(`${FIGMA_API}/me/files`, {
      headers: {
        'X-Figma-Token': token,
      },
    });

    if (filesResponse.ok) {
      const filesData = await filesResponse.json();
      console.log(`✅ Found ${filesData.files?.length || 0} files`);
      
      if (filesData.files && filesData.files.length > 0) {
        console.log('\nAvailable files:');
        filesData.files.forEach((file: any, index: number) => {
          console.log(`${index + 1}. ${file.name} (${file.key})`);
        });
      }
    } else {
      console.log(`❌ Cannot get files: ${filesResponse.status} ${filesResponse.statusText}`);
      console.log('This might be normal if you don\'t have access to any files');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkToken();
