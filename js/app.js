const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: config.contentful.space,
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: config.contentful.accessToken
});

(function(angular) {

  const notify = (message) => {
    if (true === (config.notify||true)) {
      UIkit.notification({
        message: message,
        status: 'primary',
        pos: 'top-right',
        timeout: 2000
      });
    }
  }

  const app = angular.module('slideMonitorWebapp', ['ngSanitize']);

  app.controller('TitleController', function($scope) {
    $scope.pageTitle = String((config.title || '<b>EXAMPLE</b>-TV')).replace(/<[^>]+>/gm, '')
  })

  app.controller('WeatherController', function ($scope) {
    $scope.weatherImage = ''
    $scope.weather = {}

    var updateWeather = () => {
      axios.get('http://api.openweathermap.org/data/2.5/weather?q=Berlin&appid=68f132334c5ac35049c0c1afbc431dde&units=metric')
      .then(function (response) {
        return response.data
      })
      .catch(function (error) {
        console.log(error)
      })
      .then(function (data) {
        notify('Updating Weather')
        $scope.weather = data
        $scope.weatherImage = 'url('+config.weather.backgrounds[data.weather[0].description]+')'
        console.log($scope.weatherImage)
        $scope.$apply()
      })
    }

    updateWeather()
    setInterval(() => {
      updateWeather()
    }, config.frequency)
  })

  app.controller('SlideController', function($scope) {

    var updateSlider = () => {
      $scope.slides = []

      client.getEntries({
        'content_type': config.contentful.identifiers.slides.type
      }).then((entries) => {
        $scope.$apply(function() {
          entries.items.forEach((item, index) => {
            $scope.slides.push('url(https:'+item.fields[config.contentful.identifiers.slides.property].fields.file.url+'?w='+config.slide.maxWidth+')')
          })
        })
        $scope.$apply()
  
        var slider = UIkit.slider('#slider-element', {
          center: true,
          autoplay: true,
          autoplayInterval: config.slide.speed
        });
        notify('Updating Slider')
      }).catch(err => console.log(err))
    }

    updateSlider()
    setInterval(() => {
      updateSlider()
    }, config.frequency)
  })

  app.controller('MarqueeController', function($scope) {

    var $marquee = document.getElementById('MarqueeOutput');
    var marquee = window.m = new dynamicMarquee.Marquee($marquee, { rate: config.text.speed });

    var updateMarquee = () => {
      client.getEntries({
        'content_type': config.contentful.identifiers.texts.type
      }).then((entries) => {
        $scope.$apply(function() {
          marquee.clear()
          var tempTexts = []
          entries.items.forEach((item, index) => {
            tempTexts.push(function () {
              return item.fields[config.contentful.identifiers.texts.property]
            })
          })
          


          window.l = dynamicMarquee.loop(marquee, tempTexts, function() {
            var $separator = document.createElement('div');
            $separator.innerHTML = config.text.separator;
            return $separator;
          });
        })
        notify('Updating Marquee')
      }).catch(err => console.log(err))
    }

    updateMarquee()
    setInterval(() => {
      updateMarquee()
    }, config.frequency)
  })

  app.controller('TopController', function($scope) {
    $scope.monitorTitle = config.title || '<b>EXAMPLE</b>-TV'
  })

})(window.angular);