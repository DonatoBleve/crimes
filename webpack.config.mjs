import path from 'path';

export default {
    mode: 'development', // Set the mode to 'development' or 'production'
    entry: './src/main.tsx',
    output: {
        filename: 'bundle.js',
        path: path.resolve('dist'),
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: [/node_modules/, /\.d\.ts$/], // Exclude .d.ts files
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                type: 'asset/resource',
            },
        ],
    },
    devtool: 'source-map',
};