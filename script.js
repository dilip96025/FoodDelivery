
var FoodOrder = function() {
	this.imagepath = './images/';
	this.selectedtag = [];
	this.cardholderdom = document.getElementById('cardholder');
	this.taglistdom = document.getElementById('taglist');
}

FoodOrder.prototype = {

	init: function(ev) {
		this.generateCardView(this.cardholderdom, this.getData() );
		this.renderTagView()
		this.bindEvent(ev);	
	},

	getData: function() {
		return hotelList;
	},

	bindEvent: function() {

		document.onclick = (ev) => {

			var elem = ev.target;

			if(elem.getAttribute('purpose') === 'tag') {
				
				var tagname = elem.innerText;

				elem.classList.contains('active') ? this.selectedtag.splice( this.selectedtag.indexOf(tagname), 1) : this.selectedtag.push(tagname);

				elem.classList.toggle('active', !elem.classList.contains('active'))
				
				this.handleTagFilter(this.selectedtag, this.cardholderdom)
				
			}

			if(elem.id === 'darkmode') {
				this.handledarkmode(ev);
			}
		}

		document.onkeyup = (ev) => {
			var elem = ev.target;
			if(elem.id == 'searchbox') {
				var searchkey = elem.value;

				clearTimeout(debounce);

				var debounce = setTimeout(() => {
					this.getSearchResult(searchkey, this.cardholderdom);
				},100)
			}
		}

	},

	getCard: function(item) {
		return `<article class="card">
					<div class="card-img flexM fshrink"><img src="${this.imagepath+''+item.image}"></div>
					<div class="flexG mT10 pLR10">
						<div class="flexC">
							<div class="card-title fontB flexG font15">${item.name}</div>
							<div class="card-rating">${item.rating}</div>
						</div>
						<div class="clr-S mT10">${item.location}</div>
					</div>
					<div class="fshrink clr-S flexC card-tags">${item.tags.join('<span class="clr-T mLR4">|</span>')}</div>
				</article>`
	},

	getCards: function(list) {
		var listhtml = '';

		list.forEach( (item) => {
			listhtml += this.getCard(item);
		});

		return listhtml;
	},

	generateCardView: function(dom, list) {
		
		var html='<div>';
		dom.innerHTML= '';

		if(list.length < 1) {
			html ='<div class="flexM wh100"><h1 class="flexM clr-S">No search result found</h1></div>';
		} else {
			html = `<div class="cards">${this.getCards(list)}</div>`;
		}

		dom.innerHTML= html;
		
	},

	getSearchResult: function(searchkey, containerdom) {
		var datalist = this.getData();

		var filteredlist = datalist.filter(function(item){
								return item.name.toLowerCase().includes(searchkey.toLowerCase());
						   })
		this.generateCardView(containerdom, filteredlist);
	},

	getTag: function(name) {
		return `<span class="tag-tem" purpose="tag">${name}</span>`;
	},

	getTags: function(datalist) {
		var taglisthtml = '';

		var taglist = datalist.reduce(function(acc, cur) {
			return acc.concat(cur.tags.filter((item)=> acc.indexOf(item) == -1 ));
		},[])

		taglist.forEach((item) => {
			taglisthtml += this.getTag(item);
		})

		return taglisthtml;
	},

	renderTagView: function() {
		this.taglistdom.innerHTML = this.getTags( this.getData() );
	},

	handleTagFilter: function(selectedtag, containerdom) {
		var datalist = this.getData();
		var tagfilteredlist = [];

		if(selectedtag.length) {
			tagfilteredlist = datalist.filter( function(item){
			 					return selectedtag.some((tag) => item.tags.includes(tag));
							})
		} else {	

			tagfilteredlist = datalist;
		}

		this.generateCardView(containerdom, tagfilteredlist);
	},

	handledarkmode: function(ev) {
		var checkBox = ev.target;
	  	var body = document.body;
	  	if (checkBox.checked == true){
	  		body.classList.add('dark')
	  	} else {
	    	body.classList.remove('dark')
	  	}
	}

}

