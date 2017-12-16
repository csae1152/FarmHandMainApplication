/**
 * 
 */

function init() {
    if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
    var $ = go.GraphObject.make;  // for conciseness in defining templates

    myDiagram = $(go.Diagram, "myDiagram",  // must name or refer to the DIV HTML element
                  {
                    initialContentAlignment: go.Spot.Left,
                    allowSelect: false,  // the user cannot select any part
                    // create a TreeLayout for the decision tree
                    layout: $(go.TreeLayout)
                  });

    // custom behavior for expanding/collapsing half of the subtree from a node
    function buttonExpandCollapse(e, port) {
      var node = port.part;
      node.diagram.startTransaction("expand/collapse");
      var portid = port.portId;
      node.findLinksOutOf(portid).each(function(l) {
          if (l.visible) {
            // collapse whole subtree recursively
            collapseTree(node, portid);
          } else {
            // only expands immediate children and their links
            l.visible = true;
            var n = l.getOtherNode(node);
            if (n !== null) {
              n.location = node.getDocumentPoint(go.Spot.TopRight);
              n.visible = true;
            }
          }
        });
      myDiagram.toolManager.hideToolTip();
      node.diagram.commitTransaction("expand/collapse");
    }

    // recursive function for collapsing complete subtree
    function collapseTree(node, portid) {
      node.findLinksOutOf(portid).each(function(l) {
          l.visible = false;
          var n = l.getOtherNode(node);
          if (n !== null) {
            n.visible = false;
            collapseTree(n, null);  // null means all links, not just for a particular portId
          }
        });
    }

    // get the text for the tooltip from the data on the object being hovered over
    function tooltipTextConverter(data) {
      var str = "";
      var e = myDiagram.lastInput;
      var currobj = e.targetObject;
      if (currobj !== null && (currobj.name === "ButtonA" ||
                               (currobj.panel !== null && currobj.panel.name === "ButtonA"))) {
        str = data.aToolTip;
      } else {
        str = data.bToolTip;
      }
      return str;
    }

    // define tooltips for buttons
    var tooltipTemplate =
      $(go.Adornment, "Auto",
        $(go.Shape, "Rectangle",
          { fill: "whitesmoke", stroke: "lightgray" }),
        $(go.TextBlock,
          {
            font: "8pt sans-serif",
            wrap: go.TextBlock.WrapFit,
            desiredSize: new go.Size(200, NaN),
            alignment: go.Spot.Center,
            margin: 6
          },
          new go.Binding("text", "", tooltipTextConverter))
      );

    // define the Node template for non-leaf nodes
    myDiagram.nodeTemplateMap.add("decision",
      $(go.Node, "Auto",
        new go.Binding("text", "key"),
        // define the node's outer shape, which will surround the Horizontal Panel
        $(go.Shape, "Cloud",
          { fill: "whitesmoke", stroke: "lightgray" }),
        // define a horizontal Panel to place the node's text alongside the buttons
        $(go.Panel, "Horizontal",
          $(go.TextBlock,
            { font: "26pt sans-serif", margin: 5 },
            new go.Binding("text", "key")),
          // define a vertical panel to place the node's two buttons one above the other
          $(go.Panel, "Vertical",
              { defaultStretch: go.GraphObject.Fill },
              $("Button",  // button A
                {
                  name: "ButtonA",
                  click: buttonExpandCollapse,
                  toolTip: tooltipTemplate
                },
                new go.Binding("portId", "a"),
                $(go.TextBlock,
                  new go.Binding("text", "aText"))
              ),  // end button A
              $("Button",  // button B
                {
                  name: "ButtonB",
                  click: buttonExpandCollapse,
                  toolTip: tooltipTemplate
                },
                new go.Binding("portId", "b"),
                $(go.TextBlock,
                  new go.Binding("text", "bText"))
              )  // end button B
          )  // end Vertical Panel
        )  // end Horizontal Panel
      ));  // end Node and call to add

    // define the Node template for leaf nodes
    myDiagram.nodeTemplateMap.add("personality",
      $(go.Node, "Auto",
        new go.Binding("text", "key"),
        $(go.Shape, "Rectangle",
          { fill: "whitesmoke", stroke: "lightgray" }),
        $(go.TextBlock,
          { wrap: go.TextBlock.WrapFit, desiredSize: new go.Size(200, NaN), margin: 5 },
          new go.Binding("text", "text"))
      ));

    // define the only Link template
    myDiagram.linkTemplate =
      $(go.Link,  // the whole link panel
        { fromPortId: "" },
        new go.Binding("fromPortId", "fromport"),
        $(go.Shape,  // the link shape
          { stroke: "red", strokeWidth: 2 })
      );

    // create the model for the decision tree
    var model =
      $(go.GraphLinksModel,
        { linkFromPortIdProperty: "fromport" });
    // set up the model with the node and link data
    makeNodes(model);
    makeLinks(model);
    myDiagram.model = model;

    // make all but the start node invisible
    myDiagram.nodes.each(function(n) {
        if (n.text !== "Start") n.visible = false;
      });
    myDiagram.links.each(function(l) {
        l.visible = false;
      });
  }

  function makeNodes(model) {
    var nodeDataArray = [
      { key: "Start" },  // the root node

      // intermediate nodes: decisions on personality characteristics
      { key: "I" },
      { key: "E" },

      { key: "IN" },
      { key: "IS" },
      { key: "EN" },
      { key: "ES" },

      { key: "INT" },
      { key: "INF" },
      { key: "IST" },
      { key: "ISF" },
      { key: "ENT" },
      { key: "ENF" },
      { key: "EST" },
      { key: "ESF" },

      // terminal nodes: the personality descriptions
      { key: "INTJ",
        text: "INTJ: Scientist\nThe most self-confident of all types.  They focus on possibilities and use empirical logic to think about the future.  They prefer that events and people serve some positive use.  1% of population."},
      { key: "INTP",
        text: "INTP: Architect\nAn architect of ideas, number systems, computer languages, and many other concepts.  They exhibit great precision in thought and language.  1% of the population."},
      { key: "INFJ",
        text: "INFJ: Author\nFocus on possibilities.  Place emphasis on values and come to decisions easily.  They have a strong drive to contribute to the welfare of others.  1% of population."},
      { key: "INFP",
        text: "INFP: Questor\nPresent a calm and pleasant face to the world.  Although they seem reserved, they are actually very idealistic and care passionately about a few special people or a cause.  1% of the population."},
      { key: "ISTJ",
        text: "ISTJ: Trustee\nISTJ's like organized lives. They are dependable and trustworthy, as they dislike chaos and work on a task until completion. They prefer to deal with facts rather than emotions. 6% of the population."},
      { key: "ISTP",
        text: "ISTP: Artisan\nISTP's are quiet people who are very capable at analyzing how things work. Though quiet, they can be influential, with their seclusion making them all the more skilled. 17% of the population."},
      { key: "ISFJ",
        text: "ISFJ: Conservator\nISFJ's are not particularly social and tend to be most concerned with maintaining order in their lives. They are dutiful, respectful towards, and interested in others, though they are often shy. They are, therefore, trustworthy, but not bossy. 6% of the population."},
      { key: "ISFP",
        text: "ISFP: Author\nFocus on possibilities.  Place emphasis on values and come to decisions easily.  They have a strong drive to contribute to the welfare of others.  1% of population."},
      { key: "ENTJ",
        text: "ENTJ: Fieldmarshal\nThe driving force of this personality is to lead.  They like to impose structure and harness people to work towards distant goals.  They reject inefficiency.  5% of the population."},
      { key: "ENTP",
        text: "ENTP: Inventor\nExercise their ingenuity by dealing with social, physical, and mechanical relationships.  They are always sensitive to future possibilities.  5% of the population."},
      { key: "ENFJ",
        text: "ENFJ: Pedagogue\nExcellent leaders; they are charismatic and never doubt that others will follow them and do as they ask.   They place a high value on cooperation.  5% of the population."},
      { key: "ENFP",
        text: "ENFP: Journalist\nPlace significance in everyday occurrences.  They have great ability to understand the motives of others.  They see life as a great drama.  They have a great impact on others.  5% of the population."},
      { key: "ESTJ",
        text: "ESTJ: Administrator\nESTJ's are pragmatic, and thus well-suited for business or administrative roles. They are traditionalists and conservatives, believing in the status quo. 13% of the population."},
      { key: "ESTP",
        text: "ESTP: Promoter\nESTP's tend to manipulate others in order to attain access to the finer aspects of life. However, they enjoy heading to such places with others. They are social and outgoing and are well-connected. 13% of the population."},
      { key: "ESFJ",
        text: "ESFJ: Seller\nESFJ's tend to be social and concerned for others. They follow tradition and enjoy a structured community environment. Always magnanimous towards others, they expect the same respect and appreciation themselves. 13% of the population."},
      { key: "ESFP",
        text: "ESFP: Entertainer\nThe mantra of the ESFP would be \"Carpe Diem.\" They enjoy life to the fullest. They do not, thus, like routines and long-term goals. In general, they are very concerned with others and tend to always try to help others, often perceiving well their needs. 13% of the population."}
    ];

    // Provide the same choice information for all of the nodes on each level.
    // The level is implicit in the number of characters in the Key, except for the root node.
    // In a different application, there might be different choices for each node, so the initialization would be above, where the Info's are created.
    // But for this application, it makes sense to share the initialization code based on tree level.
    for (var i = 0; i < nodeDataArray.length; i++) {
      var d = nodeDataArray[i];
      if (d.key === "Start") {
        d.category = "decision";
        d.a = "I";
        d.aText = "Introversion";
        d.aToolTip = "The Introvert is “territorial” and desires space and solitude to recover energy.  Introverts enjoy solitary activities such as reading and meditating.  25% of the population.";
        d.b = "E";
        d.bText = "Extraversion";
        d.bToolTip = "The Extravert is “sociable” and is energized by the presence of other people.  Extraverts experience loneliness when not in contact with others.  75% of the population.";
      } else {
        switch (d.key.length) {
          case 1:
            d.category = "decision";
            d.a = "N";
            d.aText = "Intuition";
            d.aToolTip = "The “intuitive” person bases their lives on predictions and ingenuity.  They consider the future and enjoy planning ahead.  25% of the population.";
            d.b = "S";
            d.bText = "Sensing";
            d.bToolTip = "The “sensing” person bases their life on facts, thinking primarily of their present situation.  They are realistic and practical.  75% of the population.";
            break;
          case 2:
            d.category = "decision";
            d.a = "T";
            d.aText = "Thinking";
            d.aToolTip = "The “thinking” person bases their decisions on facts and without personal bias.  They are more comfortable with making impersonal judgments.  50% of the population.";
            d.b = "F";
            d.bText = "Feeling";
            d.bToolTip = "The “feeling” person bases their decisions on personal experience and emotion.  They make their emotions very visible.  50% of the population.";
            break;
          case 3:
            d.category = "decision";
            d.a = "J";
            d.aText = "Judgment";
            d.aToolTip = "The “judging” person enjoys closure.  They establish deadlines and take them seriously.  They despise being late.  50% of the population.";
            d.b = "P";
            d.bText = "Perception";
            d.bToolTip = "The “perceiving” person likes to keep options open and fluid.  They have little regard for deadlines.  Dislikes making decisions unless they are completely sure they are right.  50% of the population.";
            break;
          default:
            d.category = "personality";
            break;
        }
      }
    }
    model.nodeDataArray = nodeDataArray;
  }

  // The key strings implicitly hold the relationship information, based on their spellings.
  // Other than the root node ("Start"), each node's key string minus its last letter is the
  // key to the "parent" node.
  function makeLinks(model) {
    var linkDataArray = [];
    var nda = model.nodeDataArray;
    for (var i = 0; i < nda.length; i++) {
      var key = nda[i].key;
      if (key === "Start" || key.length === 0) continue;
      // e.g., if key=="INTJ", we want: prefix="INT" and letter="J"
      var prefix = key.slice(0, key.length-1);
      var letter = key.charAt(key.length-1);
      if (prefix.length === 0) prefix = "Start";
      var obj = { from: prefix, fromport: letter, to: key };
      linkDataArray.push(obj);
    }
    model.linkDataArray = linkDataArray;
  }