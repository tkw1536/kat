/**
 * The main entry point of the service. The KAT Service requires a CSS3/XPATH selector to identify
 * the container on which annotations can be made, a coretex service url and a document identifier for
 * the annotated document.
 *
 * @author <a href="mailto:m.dumitru@jacobs-university.de">Alex Dumitru</a>
 * @author <a href="mailto:v.merticariu@jacobs-university.de">Vlad Merticariu</a>
 */


FlancheJs.defineClass("kat.main.KATService", {
  init: function (selector, coretexUrl, documentName) {
    this._selector = selector;
    this._ontologyRegistry = new kat.annotation.OntologyRegistry();
    this._conceptRegistry = new kat.annotation.ConceptRegistry();
    this._coretexInserter = new kat.remote.CoreTexAnnotationInserter(coretexUrl, documentName, this._conceptRegistry);
    this._coretexRetriever = new kat.remote.CoreTeXAnnotationRetriever(coretexUrl, documentName, this._conceptRegistry, jQuery(selector));
    this._annotationRegistry = new kat.annotation.AnnotationRegistry();
  },

  methods: {
    run: function () {

      //register error handler
      window.onerror = function (message) {
        $.pnotify({
          title: 'KAT Error',
          text : message,
          type : 'error'
        })
      }
      var preProcessor = new kat.preprocessor.TextPreprocessor(this._selector, "", this._ontologyRegistry, this._conceptRegistry, this._annotationRegistry);
      preProcessor.run();
      var currentAnnotations = this._annotationRegistry.getAnnotations();
      var renderedAnnotations = [];
      for (var i = 0; i < currentAnnotations.length; i++) {
        var renderer = new kat.display.AnnotationRenderer(currentAnnotations[i], this._conceptRegistry);
        renderedAnnotations.push(renderer.render())
      }
      var displayer = new kat.Display(renderedAnnotations, this._annotationRegistry, this._conceptRegistry);
      displayer.run();
      preProcessor.setDisplay(displayer);
      this._annotationRegistry.setDisplay(displayer);
      var ontologyViewer = new kat.display.AnnotationOntologyViewer(this._ontologyRegistry, this._conceptRegistry, this._annotationRegistry);
      ontologyViewer.run();
    }
  },

  internals: {
    selector          : null,
    annotationRegsitry: null,
    ontologyRegistry  : null,
    conceptRegistry   : null,
    coretexInserter   : null,
    coretexRetriever  : null
  }

})

//only used for demo, to retrieve and add an ontology
//jQuery.get("http://localhost/katGit/test/newAnnotationOntology.xml", function(xmlOntology){
//  var ontology = new kat.annotation.Ontology("OMDoc", xmlOntology);
//  var name = "OMDoc";
//  self._ontologyRegistry.addOntology(ontology);
//  var newConcepts = ontology.getDefinition().getXmlDoc().getElementsByTagName("concept");
//  for (var i = 0; i < newConcepts.length; i++) {
//    var conceptName = newConcepts[i].getAttribute("name");
//    //conceptsText += '<i class="icon-arrow-right"></i> <b>' + name + "." + conceptName + "</b><br/>";
//    self._conceptRegistry.addConcept(new kat.annotation.Concept(name + "." + conceptName, newConcepts[i], name));
//  }
//})
