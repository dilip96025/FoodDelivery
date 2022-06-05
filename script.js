
var FoodOrder = function() {
	this.imagepath = './images/';
	this.selectedtag = [];
	this.cardholderdom = document.getElementById('cardholder');
	this.taglistdom = document.getElementById('taglist');
	this.darkmodecheckbox = document.getElementById('darkmode');
	this.modalwindowdom = '';
	this.currentpreviewid = '';
	this.isdarkchoosed = false;
}

FoodOrder.prototype = {

	init: function(ev) {
		this.generateCardView(this.cardholderdom, this.getData() );
		this.renderTagView()
		this.bindEvent(ev);
		this.isdarkchoosed = this.getLocalStorageData('darkmode');
		this.syncDarkMode(this.isdarkchoosed, this.darkmodecheckbox)
	},

	getData: function() {
		return hotelList;
	},

	bindEvent: function() {

		document.onclick = (ev) => {

			var elem = ev.target;
			var purpose = elem.getAttribute('purpose');

			if( purpose === 'tag') {
				this.handleTagSelection(elem)
			}
			else if ( purpose == 'card' || elem.closest('[purpose="card"]') && elem.closest('[purpose="card"]').getAttribute('purpose') == 'card' ) {
				var cardelem = elem.closest('[purpose="card"]');
				
				this.handleCardPreview(cardelem.id)
			}
			else if( purpose ==  'closemodal' ) {
				this.modalwindowdom.remove();
				this.currentpreviewid='';
			}
			else if( purpose == 'leftnav' ) {
				this.handlePreviewAction('left', this.currentpreviewid )
			}
			else if( purpose == 'rightnav' ) {
				this.handlePreviewAction('right', this.currentpreviewid )
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
		return `<article class="card" purpose="card" id="${item.id}">
					<div class="card-img flexM fshrink"><img src="${this.imagepath+''+item.image}"></div>
					<div class="flexG mT10 pLR10 card-content">
						<div class="flexC">
							<div class="card-title fontB flexG">${item.name}</div>
							<div class="card-rating">${item.rating}</div>
						</div>
						<div class="clr-S mT10 card-location">${item.location}</div>
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

	handleTagSelection: function(elem) {
		var tagname = elem.innerText;

		elem.classList.contains('active') ? this.selectedtag.splice( this.selectedtag.indexOf(tagname), 1) : this.selectedtag.push(tagname);

		elem.classList.toggle('active', !elem.classList.contains('active'))
		
		this.handleTagFilter(this.selectedtag, this.cardholderdom)
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
	  		this.updateLocalStorageData('darkmode', 1)
	  	} else {
	    	body.classList.remove('dark')
	    	this.updateLocalStorageData('darkmode', 0);
	  	}
	},

	syncDarkMode: function(isdarkchoosed, dom) {
		if( parseInt(isdarkchoosed) )  {
			dom.checked=true;
			document.body.classList.add('dark');
		}
	},

	updateLocalStorageData: function(key,value) {
		return localStorage.setItem(key, value);
	},

	getLocalStorageData: function(key) {
		return localStorage.getItem(key);
	},

	getLoaderHtml: function() {
		return `<span class="loader"></span></div>`;
	},

	handleCardPreview: function(id) {
		
		this.currentpreviewid = id;

		var modalhtml = `<div class="modal flexM" id="modalwindow">
							<span class="closeIcon flexM" purpose="closemodal">&#x2715</span>
							<span class="arrowIcon leftArrow flexM" purpose="leftnav"></span>
							<span class="arrowIcon rightArrow flexM" purpose="rightnav"></span>
							<div class="modal-main" id="modalmain"></div>
						</div>`;

		document.body.innerHTML += modalhtml;

		this.modalwindowdom = document.getElementById('modalwindow')

		this.handleCardPreviewUpdate(id);
	},

	handleCardPreviewUpdate: function(id) {

		var curcard = this.getData().filter((item) => item.id == id )[0];

		var carddetailhtml = this.getCard(curcard)

		this.modalwindowdom.querySelector('#modalmain').innerHTML = carddetailhtml;
	},

	handlePreviewAction: function(dir, id) {
		
		if( ( dir == 'left' && id == 1 ) || ( dir == 'right' && id == this.getData().length ) ) {
			return;
		}
		if( dir == 'left' ) {
			--this.currentpreviewid;
		} else if(dir == 'right') {
			++this.currentpreviewid;
		}

		this.handleCardPreviewUpdate( this.currentpreviewid )
	}



}
