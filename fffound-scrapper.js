Images = new Mongo.Collection('images');

if (Meteor.isClient) {

  //иницилизируем глобальную переменную 
  images =[];
  // без слова var

  Meteor.call('getImages', function (error, result) {
    if (error) {
      console.log("error", error);
    };
    Session.set("images", result);
  });

  Template.imageList.helpers({
    images: function () {
      return Images.find().fetch();
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    var cheerio = Meteor.npmRequire('cheerio');

    Meteor.methods({
      getImages: function () {
        result = Meteor.http.get("http://ffffound.com/?offset=25");
        $ = cheerio.load(result.content);

        data = $(".description").html();

        var images = [];
        $('.description').each(function(i, elem) {
          images[i] = $(this).html().split('<br>')[0];

          if(images[i].substr(0,7) != 'http://') images[i] = 'http://' + images[i];
          
          console.log(images[i]);
          // checking for uniqueness
          var postWithSameLink = Images.findOne({link: images[i]});
          if (postWithSameLink) return true;
          // end check
          Images.insert(
            {
              link: images[i]
            });
        });
        return images;
      }
    });

  });
}