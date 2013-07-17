'use strict';

/* Se crea la aplicación */
angular.module('meetup', []).
    config(function($routeProvider) {
        $routeProvider.
        when('/', {
            controller: IndexCtrl,
            templateUrl: 'partials/lista_eventos.html'
        }).
        when('/evento/:idEvento', {
            controller: VerEventoCtrl, 
            templateUrl: 'partials/ver_evento.html'
        }).
        otherwise({redirectTo: '/'});
    })
	/* Servicio usado para compartir el evento entre controladores */
	.service('Evento', function () {
		var evento = null;

		return {
			getEvento: function () {
				return evento;
			},
			setEvento: function(value) {
				evento = value;
			}
		};
	});

/* Controlador usado para maneja la visualización de un evento en concreto */
function VerEventoCtrl($scope, $routeParams, $http, Evento) {
    var meetupAPI="http://api.meetup.com/2/rsvps?format=jsonp&callback=?";
    $scope.asistentes = [];
    $scope.evento = Evento.getEvento();

	/* Consulta de un evento usando su ID */
    $http.jsonp(meetupAPI, {
        params: {
            callback: 'JSON_CALLBACK',
			event_id: $routeParams.idEvento,
			order: 'event',
			rsvp: 'yes',
			desc: false,
			offset: 0,
			format: 'json',
			page: 200,			
			sign : true,
			key: '2e315e2e7450773444574a712d5619'
        }
    })
    .success(function(data){
        $scope.asistentes = data.results; 
    })
    .error(function() {
        $scope.tweet = "<strong>Error: could not make JSONP request to Meetup.</strong>"; 
    });
}

/* Controlador usado para manejar la consulta y visualización de los eventos */
function IndexCtrl($scope, $http, $location, Evento) {
   	var meetupAPI="http://api.meetup.com/2/events?format=jsonp&callback=?";
    $scope.eventos = [];

    $scope.viewDetail = function(evento) {
        Evento.setEvento(evento);
        $location.path('/evento/' + evento.id);
    }

	/* Helper que pasa la fecha de timestanp a humano */
    $scope.fecha = function(value) {
        var nice_date = moment(value).format("LLL");
        return nice_date;
    }

	/* Helper que ayuda a traducir el estado del evento al español */
    $scope.estado = function(value) {
        var estado = 'realizado';
        var label = 'success';

        if (value == 'upcoming') {
            estado = 'pendiente';
            label = 'warning';
        }

        return estado;
    }

	/* Helper que ayuda a obtener una etqiqueta acorde para el estado del evento */
    $scope.etiquetaEstado = function(value) {
        var label = 'success';

        if (value == 'upcoming') {
            label = 'warning';
        }

        return label;
    }

	/* Consulta de los eventos */
    $http.jsonp(meetupAPI, {
        params: {
            callback: 'JSON_CALLBACK',
            status :'past,upcoming',
            order : 'time',
            limited_events : true,
            group_urlname : 'medellinjs',
            desc : false,
            offset : 0,
            format : 'json',
            page : 20,
            fields : 'id,name,description',			
            sign : true,
            key: '2e315e2e7450773444574a712d5619'
        }
    })
    .success(function(data){
        data.results.forEach(function (evento) {
            $scope.eventos.push(evento);
        });	  
    })
    .error(function() {
        $scope.eventos = "<strong>Error: could not make JSONP request to Meetup.</strong>"; 
    });
}