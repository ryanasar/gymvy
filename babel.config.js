module.exports = function (api) {
  api.cache(true);

  const plugins = [
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
        },
      },
    ],
  ];

  if (process.env.NODE_ENV === 'production') {
    plugins.push('transform-remove-console');
  }

  plugins.push('react-native-reanimated/plugin'); // Must be last

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
