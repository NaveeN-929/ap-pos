const path = require('path');

module.exports = {
  mode: 'development', // or 'production' based on your needs
  entry: './src/index.js', // Entry point for the React app
  output: {
    path: path.resolve(__dirname, 'build'), // Output directory
    filename: 'bundle.js', // Output bundle file
  },
  module: {
    rules: [
      // Babel loader for React JSX
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Babel presets for React and modern JavaScript
          },
        },
      },
      // CSS loader for CSS stylesheets (including Tailwind CSS)
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // Source map loader to ignore the html2pdf.js warnings
      {
        test: /\.map$/,
        loader: 'ignore-loader', // Ignores all .map files (to prevent warning for missing source maps)
      },
      // Other file types like images, fonts, etc. can go here
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: ['file-loader'],
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: /node_modules\/html2pdf\.js/, // Exclude the problematic library
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Resolves these extensions in imports
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    port: 3000, // Your preferred port for dev server
    hot: true, // Hot module replacement for better dev experience
  },
  devtool: 'source-map', // Use source maps for debugging
  // Configuration to prevent warnings related to source maps in html2pdf.js
  ignoreWarnings: [
    {
      module: /html2pdf.js/,
      message: /Failed to parse source map/,
    },
  ],
};
