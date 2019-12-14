import Portfolio from './controllers/portfolio';
import multer from 'multer';

export default (app: any) => {
    app.get('/', (req: any, res: any) => {
        console.log(__dirname);
        res.sendFile(__dirname + '/index.html');
      });
    app.post('/portfolio', multer({ dest: 'uploads/'}).single(
        'csv'
      ), Portfolio.create);
}